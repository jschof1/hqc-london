"""Extract approved Batch 6 legal body for staging, retaining the cancellation matrix.

Usage: python3 scripts/import-phase8-legal.py /path/to/batch6.docx
These controlled drafts contain production-verification placeholders; the release
checklist must be completed before publication.
"""

import json
import sys
from pathlib import Path

from docx import Document
from docx.text.paragraph import Paragraph


def extract(path):
    pages = {'privacy': [], 'terms': []}
    current = None
    for block in Document(path).iter_inner_content():
        if isinstance(block, Paragraph):
            value = block.text.strip()
            if block.style.name == 'Heading 1':
                if value.startswith('PAGE 1 - PRIVACY POLICY'):
                    current = 'privacy'
                elif value.startswith('PAGE 2 - TERMS & CONDITIONS'):
                    current = 'terms'
                elif value.startswith('PART 3 -'):
                    break
                continue
            if not current or not value:
                continue
            if value.startswith('H1 - '):
                continue
            kind = 'h2' if block.style.name == 'Heading 2' else 'h3' if block.style.name == 'Heading 3' else 'li' if block.style.name.startswith('List') else 'p'
            pages[current].append({'kind': kind, 'text': value})
        elif current == 'terms' and len(block.rows) == 15 and len(block.columns) == 4:
            pages[current].append({'kind': 'table', 'rows': [[cell.text.strip() for cell in row.cells] for row in block.rows]})
    for key in pages:
        grouped = []
        for block in pages[key]:
            if block['kind'] == 'li':
                if not grouped or grouped[-1]['kind'] != 'ul':
                    grouped.append({'kind': 'ul', 'items': []})
                grouped[-1]['items'].append(block['text'])
            else:
                grouped.append(block)
        pages[key] = grouped
    return pages


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    result = extract(sys.argv[1])
    output = Path(__file__).resolve().parent.parent / 'src/data/phase8-legal.json'
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {len(result["privacy"])} privacy and {len(result["terms"])} terms blocks to {output}')
