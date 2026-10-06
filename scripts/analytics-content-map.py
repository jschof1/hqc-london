"""Map analytics item numbers to published headings; run only against local preview."""
import json, sys, urllib.request
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
root = Path(__file__).resolve().parents[1]
base = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4328"
assert urlparse(base).hostname in ["localhost", "127.0.0.1"]
class Content(HTMLParser):
    def __init__(self):
        super().__init__(); self.main = False; self.sections=[]; self.faqs=[]; self.open_sections=[]; self.capture=None
    def handle_starttag(self, tag, attrs):
        if tag == "main": self.main = True
        if not self.main: return
        if tag == "section":
            self.sections.append({"item": str(len(self.sections)+1), "id": dict(attrs).get("id"), "heading": ""}); self.open_sections.append(self.sections[-1])
        if tag == "details": self.faqs.append({"item": str(len(self.faqs)+1), "question": ""})
        if tag in ["h1", "h2", "h3", "summary"]: self.capture=[tag, ""]
    def handle_data(self, text):
        if self.capture: self.capture[1] += text
    def handle_endtag(self, tag):
        if self.capture and self.capture[0] == tag:
            value = " ".join(self.capture[1].split())
            if tag == "summary" and self.faqs: self.faqs[-1]["question"] = value
            else:
                for section in self.open_sections:
                    if not section["heading"]: section["heading"] = value
            self.capture = None
        if tag == "section" and self.open_sections: self.open_sections.pop()
        if tag == "main": self.main = False
records = {}
for path in json.loads((root / "src/data/analytics-paths.json").read_text()):
    with urllib.request.urlopen(base + path) as response:
        final = urlparse(response.url).path
        if final != path: continue
        parser = Content(); parser.feed(response.read().decode())
        records[path] = {"content_viewed": parser.sections[:20], "faq_opened": parser.faqs[:100]}
(root / "docs/plausible-content-map.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
print(f"Mapped {len(records)} pages; no forms submitted and no external resources requested.")
