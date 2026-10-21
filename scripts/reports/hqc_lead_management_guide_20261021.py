#!/usr/bin/env python3
"""Create and verify Pedro's two-page HQC guide, without provider access.

Run from any directory:
    python3 scripts/reports/hqc_lead_management_guide_20261021.py

Dependencies: reportlab, Pillow and PyMuPDF; Poppler is preferred for rendering.
ReportLab may be installed locally in the output directory's .deps folder.
Fonts default to the Mac's locally installed Arial and Georgia. Override
HQC_GUIDE_FONT_DIR with a directory containing the same TTF filenames if needed.

The dated setup snapshot below reflects fresh GHL and public website checks.
Update it only after fresh provider verification. No customer data is included.
The first authoring marker was run successfully before this script was created;
this script deliberately does not rerun that operation marker.
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output/pdf/hqc-lead-management-preview"
sys.path.insert(0, str(OUT / ".deps"))
sys.dont_write_bytecode = True

import fitz
from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


PDF = OUT / "hqc-lead-management-guide-2026-10-21.pdf"
LOGO = ROOT / "public/images/brand/hqc-full-gold.webp"
FONT_DIR = Path(os.environ.get("HQC_GUIDE_FONT_DIR", "/System/Library/Fonts/Supplemental"))

# Brand colours copied from src/styles/global.css; logo used unaltered.
INK = HexColor("#14272c")
SLATE = HexColor("#52656a")
MIST = HexColor("#f5f2eb")
PAPER = HexColor("#f7f5ef")
GOLD = HexColor("#cda76b")
NAVY = HexColor("#18363c")
MIDNIGHT = HexColor("#0e2a31")
RULE = HexColor("#dddcd4")

WIDTH, HEIGHT = A4
MARGIN = 44
CONTENT = WIDTH - 2 * MARGIN
STATUS = "Five stages live · automatic enquiry tags"
SNAPSHOT = "21 October 2026, 13:00 BST"

STAGES = [
    ("New Lead", "New Lead", "A new enquiry needs attention. Check the details and record who will follow up."),
    ("Contacted", "Contacted", "You have called or personally messaged the lead and recorded it. Log the outcome; an automatic form reply does not count."),
    ("Scheduled", "Scheduled", "The booking is confirmed with the customer. Record the agreed date and job details; a requested service date does not count."),
    ("Paid", "Paid", "Full payment has been received and confirmed. A deposit does not count. A prepaid job still needs to be completed before a review request."),
    ("Review Request Sent", "Review Request<br/>Sent", "The service is completed and a review request has actually been sent. Record the send; payment or a review posted by the customer does not count."),
]

ROUTINE = [
    ("Review new enquiries", "Read the latest contact note and open your assigned task."),
    ("Contact and record", "Call or personally message the lead. Log the attempt and move to Contacted."),
    ("Set the next action", "Add a dated follow-up task. Move to Scheduled when the customer confirms the booking."),
    ("After the job", "Confirm full payment. Request a review only after completed service, then record the actual send."),
]

SETUP = [
    ("Automation", "Every receipt creates Pedro's task. Paid creates a completion-check task."),
    ("Verification", "Five website form types checked in GHL. No customer message has been sent during setup."),
]

LAYOUT_CHECKS: list[dict] = []


def register_fonts() -> None:
    for name, filename in [("Body", "Arial.ttf"), ("BodyBold", "Arial Bold.ttf"), ("Display", "Georgia.ttf")]:
        font = FONT_DIR / filename
        if not font.is_file():
            raise FileNotFoundError(f"Missing local font: {font}. Set HQC_GUIDE_FONT_DIR.")
        pdfmetrics.registerFont(TTFont(name, str(font)))
    pdfmetrics.registerFontFamily("Body", normal="Body", bold="BodyBold")


def rect(c, x, top, width, height, fill, radius=0, stroke=None):
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    c.setLineWidth(0.7)
    if radius:
        c.roundRect(x, HEIGHT - top - height, width, height, radius, fill=1, stroke=bool(stroke))
    else:
        c.rect(x, HEIGHT - top - height, width, height, fill=1, stroke=bool(stroke))


def paragraph(c, text, x, top, width, size=10.7, leading=14.5, font="Body", colour=INK, max_height=100, align=0):
    style = ParagraphStyle("text", fontName=font, fontSize=size, leading=leading,
                           textColor=colour, alignment=align, spaceBefore=0,
                           spaceAfter=0, splitLongWords=False, allowWidows=0,
                           allowOrphans=0)
    item = Paragraph(text, style)
    _, height = item.wrap(width, 2000)
    if height > max_height + 0.1:
        raise ValueError(f"Text exceeds its reserved height ({height} > {max_height}): {text}")
    if x < MARGIN - 1 or x + width > WIDTH - MARGIN + 1 or top < 25 or top + height > HEIGHT - 28:
        raise ValueError(f"Text exceeds page content bounds: {text}")
    LAYOUT_CHECKS.append({"page": c.getPageNumber(), "top": top, "height": height,
                          "available_height": max_height, "text": text})
    item.drawOn(c, x, HEIGHT - top - height)
    return height


def line(c, x1, top1, x2, top2, colour=RULE, width=0.6):
    c.setStrokeColor(colour)
    c.setLineWidth(width)
    c.line(x1, HEIGHT - top1, x2, HEIGHT - top2)


def image_logo(c, x, top, size):
    with Image.open(LOGO) as logo:
        c.drawImage(ImageReader(logo), x, HEIGHT - top - size, size, size)


def number(c, label, x, top, size=22, filled=True):
    rect(c, x, top, size, size, NAVY if filled else MIST, radius=size/2)
    paragraph(c, label, x, top + 5.5, size, size=8.8, leading=10,
              font="BodyBold", colour=white if filled else NAVY,
              max_height=11, align=TA_CENTER)


def footer(c, page):
    line(c, MARGIN, 796, WIDTH - MARGIN, 796)
    paragraph(c, "HIGH QUALITY CLEAN  /  LEAD MANAGEMENT", MARGIN, 803, CONTENT-60,
              size=8.1, leading=10, font="BodyBold", colour=SLATE, max_height=11)
    paragraph(c, f"0{page} / 02", WIDTH - MARGIN - 49, 803, 49,
              size=8.6, leading=10, colour=SLATE, max_height=11, align=2)


def base(c):
    rect(c, 0, 0, WIDTH, HEIGHT, PAPER)
    rect(c, 0, 0, WIDTH, 5, NAVY)


def page_one(c):
    base(c)
    image_logo(c, MARGIN, 36, 80)
    paragraph(c, "A PRACTICAL GUIDE FOR PEDRO", 142, 43, CONTENT-98,
              size=9.1, leading=12, font="BodyBold", colour=SLATE, max_height=13)
    paragraph(c, "Lead Management", 140, 64, CONTENT-96,
              size=28, leading=35, font="Display", colour=MIDNIGHT, max_height=36)
    paragraph(c, "A clear next step for every enquiry.", 142, 103, CONTENT-98,
              size=11.2, leading=15, colour=SLATE, max_height=16)

    rect(c, MARGIN, 138, CONTENT, 28, NAVY, radius=5)
    paragraph(c, STATUS, MARGIN+13, 145, CONTENT-26,
              size=10.6, leading=14, font="BodyBold", colour=white, max_height=15)
    paragraph(c, "Use the board to show what has actually happened, then record the next action. Move a lead only when the stage below is true.",
              MARGIN, 183, CONTENT, size=11.1, leading=16, colour=SLATE, max_height=33)

    paragraph(c, "THE AGREED FIVE-STAGE FLOW", MARGIN, 233, CONTENT,
              size=9.1, leading=12, font="BodyBold", colour=NAVY, max_height=13)
    gap = 13
    box_width = (CONTENT - 4*gap)/5
    labels = ["New Lead", "Contacted", "Scheduled", "Paid", "Review<br/>Request Sent"]
    for i, label in enumerate(labels):
        x = MARGIN + i*(box_width+gap)
        rect(c, x, 254, box_width, 83, white, radius=6, stroke=RULE)
        paragraph(c, f"0{i+1}", x, 265, box_width, size=9, leading=12,
                  font="BodyBold", colour=SLATE, max_height=13, align=TA_CENTER)
        paragraph(c, label, x+4, 287, box_width-8, size=10.5, leading=14,
                  font="BodyBold", colour=NAVY, max_height=29, align=TA_CENTER)
        if i < 4:
            ax = x + box_width + 3
            ay = 295
            line(c, ax, ay, ax+7, ay, GOLD, 1.5)
            line(c, ax+4, ay-3, ax+7, ay, GOLD, 1.5)
            line(c, ax+4, ay+3, ax+7, ay, GOLD, 1.5)

    paragraph(c, "When to move each lead", MARGIN, 361, CONTENT,
              size=19, leading=24, font="Display", colour=MIDNIGHT, max_height=25)
    row_tops = [402, 464, 531, 601, 677]
    row_heights = [52, 57, 60, 66, 77]
    for i, (_, title, definition) in enumerate(STAGES):
        top = row_tops[i]
        number(c, f"0{i+1}", MARGIN, top, 22)
        paragraph(c, title, 77, top+2, 138, size=11.8, leading=15.8,
                  font="BodyBold", colour=NAVY, max_height=33)
        paragraph(c, definition, 224, top, WIDTH-MARGIN-224,
                  size=10.6, leading=14.5, max_height=row_heights[i])
        if i < 4:
            line(c, MARGIN, top+row_heights[i], WIDTH-MARGIN, top+row_heights[i])
    footer(c, 1)
    c.showPage()


def page_two(c):
    base(c)
    image_logo(c, MARGIN, 36, 64)
    paragraph(c, "FROM ENQUIRY TO FOLLOW-UP", 126, 39, CONTENT-82,
              size=9.1, leading=12, font="BodyBold", colour=SLATE, max_height=13)
    paragraph(c, "The daily routine", 124, 59, CONTENT-80,
              size=27, leading=34, font="Display", colour=MIDNIGHT, max_height=35)
    paragraph(c, "Keep leads and bookings moving with a few simple habits.", MARGIN, 115,
              CONTENT, size=11.1, leading=16, colour=SLATE, max_height=17)

    rect(c, MARGIN, 146, CONTENT, 38, MIST, radius=5, stroke=RULE)
    paragraph(c, "GHL &gt; Opportunities &gt; Lead Management. Read the contact's Notes and your assigned Tasks.",
              MARGIN+12, 155, CONTENT-24, size=10.5, leading=14,
              colour=NAVY, max_height=29)

    top = 201
    for i, (title, action) in enumerate(ROUTINE):
        number(c, str(i+1), MARGIN, top+1, 20, filled=False)
        paragraph(c, title, 76, top, CONTENT-32, size=11.1, leading=14,
                  font="BodyBold", colour=NAVY, max_height=15)
        paragraph(c, action, 76, top+16, CONTENT-32, size=10.5, leading=14,
                  colour=SLATE, max_height=29)
        top += 45

    rect(c, MARGIN, 388, CONTENT, 96, white, radius=5, stroke=RULE)
    paragraph(c, "Find the right enquiry with tags", MARGIN+12, 399, CONTENT-24,
              size=15, leading=19, font="Display", colour=MIDNIGHT, max_height=20)
    chip_gap = 8
    chip_width = (CONTENT-24-2*chip_gap)/3
    for i, label in enumerate(["Source: Website", "Type: Residential", "Service: Deep clean"]):
        x = MARGIN+12+i*(chip_width+chip_gap)
        rect(c, x, 427, chip_width, 20, MIST, radius=4)
        paragraph(c, label, x+5, 432, chip_width-10, size=9.2, leading=11,
                  font="BodyBold", colour=NAVY, max_height=12, align=TA_CENTER)
    paragraph(c, "Source, type and service tags are automatic enquiry history. Tags accumulate on repeat enquiries; the board and latest Note show current progress.",
              MARGIN+12, 454, CONTENT-24, size=10.1, leading=13, colour=SLATE, max_height=27)
    paragraph(c, "<b>Contacts &gt; Smart Lists:</b> HQC - Website enquiries, HQC - Residential interest and HQC - Commercial interest. New sales enquiries appear as they arrive; historical contacts have not been retagged.",
              MARGIN, 498, CONTENT, size=10.3, leading=14, colour=SLATE, max_height=43)

    rect(c, MARGIN, 552, CONTENT, 56, white, radius=5, stroke=RULE)
    paragraph(c, "<b>Lost or abandoned?</b> Use the deal status and record a short reason; keep the five stages.",
              MARGIN+12, 560, CONTENT-24, size=10.3, leading=14, max_height=29)
    paragraph(c, "<b>Repeated enquiry?</b> Read the latest Note and review the existing deal before reopening.",
              MARGIN+12, 590, CONTENT-24, size=10.1, leading=13, max_height=14)

    rect(c, MARGIN, 624, CONTENT, 151, NAVY, radius=7)
    paragraph(c, "Where setup stands", MARGIN+16, 638, CONTENT-32,
              size=18, leading=23, font="Display", colour=white, max_height=24)
    paragraph(c, f"{STATUS}  |  {SNAPSHOT}", MARGIN+16, 667, CONTENT-32,
              size=8.5, leading=11, colour=HexColor("#e2d3ba"), max_height=12)
    for (label, description), top, height in zip(SETUP, [692, 731], [29, 29]):
        paragraph(c, label, MARGIN+16, top, 85, size=10.2, leading=13.5,
                  font="BodyBold", colour=GOLD, max_height=15)
        paragraph(c, description, MARGIN+107, top, CONTENT-123,
                  size=10.4, leading=13.8, colour=white, max_height=height)
    footer(c, 2)
    c.showPage()


def render() -> list[Path]:
    prefix = OUT / "page"
    poppler = shutil.which("pdftoppm")
    if poppler:
        subprocess.run([poppler, "-r", "150", "-png", str(PDF), str(prefix)], check=True)
    else:
        with fitz.open(PDF) as doc:
            for i, page in enumerate(doc, 1):
                page.get_pixmap(matrix=fitz.Matrix(150/72, 150/72), alpha=False).save(OUT / f"page-{i}.png")
    return [OUT / f"page-{i}.png" for i in (1, 2)]


def validate(pngs: list[Path]) -> dict:
    with fitz.open(PDF) as doc:
        assert doc.page_count == 2, f"Unexpected page count: {doc.page_count}"
        texts = []
        text_boxes = []
        for i, page in enumerate(doc, 1):
            assert abs(page.rect.width-WIDTH) < 0.1 and abs(page.rect.height-HEIGHT) < 0.1, "Not A4"
            # Preserve PDF drawing order. Position sorting can interleave the
            # stage label with its adjacent multi-line definition.
            texts.append(page.get_text(sort=False))
            for block in page.get_text("dict")["blocks"]:
                for text_line in block.get("lines", []):
                    for span in text_line["spans"]:
                        box = fitz.Rect(span["bbox"])
                        assert box.x0 >= MARGIN-0.5 and box.x1 <= WIDTH-MARGIN+0.5, f"Horizontal overflow: {span}"
                        assert box.y0 >= 25 and box.y1 <= HEIGHT-20, f"Vertical overflow: {span}"
                        assert "\ufffd" not in span["text"] and "\u25a0" not in span["text"], "Missing glyph"
                        text_boxes.append((i, tuple(box), span["text"]))
        full_text = "\n".join(texts)
        flattened = " ".join(full_text.split())
        for required in [STATUS, "New Lead", "Contacted", "Scheduled", "Paid", "Review Request Sent",
                         "Full payment has been received and confirmed", "A deposit does not count",
                         "an automatic form reply does not count", "a requested service date does not count",
                         "a review request has actually been sent", "Repeated enquiry?",
                         "Lost or abandoned?", "automatic enquiry tags", "Every receipt creates Pedro",
                         "Paid creates a completion-check task", "Five website form types checked in GHL",
                         "No customer message has been sent", "Tags accumulate on repeat enquiries", "HQC - Commercial interest", SNAPSHOT]:
            assert required in flattened, f"Missing required wording: {required}"
        for forbidden in ["59972c9", "webhook", "token", "pipeline ID", "exactly-once", "all live", "@", "07427"]:
            assert forbidden.lower() not in full_text.lower(), f"Unwanted detail: {forbidden}"
        # Separate text lines must not overlap across independently placed blocks.
        overlaps = []
        for j, (page_a, bbox_a, text_a) in enumerate(text_boxes):
            for page_b, bbox_b, text_b in text_boxes[j+1:]:
                if page_a != page_b:
                    continue
                a, b = fitz.Rect(bbox_a), fitz.Rect(bbox_b)
                inter = a & b
                if not inter.is_empty and inter.width > 1 and inter.height > 1:
                    overlaps.append([page_a, text_a, text_b, list(inter)])
        assert not overlaps, f"Overlapping text spans: {overlaps}"
        assert not doc.is_encrypted
        images = []
        for png in pngs:
            assert png.is_file() and png.stat().st_size > 10000
            with Image.open(png) as im:
                images.append({"path": str(png.relative_to(ROOT)), "size": list(im.size)})
        (OUT / "extracted-text.txt").write_text(full_text, encoding="utf-8")
        report = {
            "pdf": str(PDF.relative_to(ROOT)), "pages": doc.page_count, "format": "A4 portrait",
            "sha256": hashlib.sha256(PDF.read_bytes()).hexdigest(),
            "snapshot": SNAPSHOT, "snapshot_source": "fresh GHL UI/API and isolated runtime verification by parent",
            "fonts": sorted({font[3] for page in doc for font in page.get_fonts()}),
            "body_font_size_pt": "10.3-11.1", "layout_boxes_checked": len(LAYOUT_CHECKS),
            "text_bounds": "PASS", "text_overlap": "PASS", "required_wording": "PASS",
            "rendered_pages": images,
            "visual_inspection": "Required separately using view_image on both rendered pages",
        }
    (OUT / "validation.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    register_fonts()
    c = canvas.Canvas(str(PDF), pagesize=A4, pageCompression=1, invariant=1)
    c.setTitle("High Quality Clean | Lead Management | Guide for Pedro")
    c.setAuthor("High Quality Clean")
    c.setSubject("Live five-stage workflow and human stage checks. Snapshot: " + SNAPSHOT)
    page_one(c)
    page_two(c)
    c.save()
    result = validate(render())
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
