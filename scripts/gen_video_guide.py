#!/usr/bin/env python3
"""Generate Video Production Guide PDF for GOI YouTube channel"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

W, H = A4

# ── Palette ──────────────────────────────────────────────────────────────────
BG         = HexColor('#070b14')
SURFACE    = HexColor('#0d1224')
SURFACE2   = HexColor('#111827')
ACCENT     = HexColor('#6366f1')
AMBER      = HexColor('#f59e0b')
GREEN      = HexColor('#10b981')
RED        = HexColor('#ef4444')
PURPLE     = HexColor('#8b5cf6')
CYAN       = HexColor('#06b6d4')
TEXT       = HexColor('#f1f5f9')
TEXT_MUTED = HexColor('#94a3b8')
TEXT_DIM   = HexColor('#475569')
BORDER     = HexColor('#1e2a4a')

def S(name, **kw):
    return ParagraphStyle(name, **kw)

TITLE_STYLE = S('title',
    fontName='Helvetica-Bold', fontSize=24, textColor=TEXT,
    alignment=TA_CENTER, spaceAfter=4)

SUBTITLE_STYLE = S('subtitle',
    fontName='Helvetica', fontSize=12, textColor=TEXT_MUTED,
    alignment=TA_CENTER, spaceAfter=2)

BADGE_STYLE = S('badge',
    fontName='Helvetica-Bold', fontSize=8, textColor=ACCENT,
    alignment=TA_CENTER, spaceAfter=14)

STEP_NUM = S('step_num',
    fontName='Helvetica-Bold', fontSize=22, textColor=ACCENT,
    alignment=TA_CENTER, spaceAfter=0)

STEP_TITLE = S('step_title',
    fontName='Helvetica-Bold', fontSize=11, textColor=TEXT,
    spaceAfter=5)

LABEL = S('label',
    fontName='Helvetica-Bold', fontSize=7, textColor=ACCENT,
    spaceAfter=4, charSpace=1)

BODY = S('body',
    fontName='Helvetica', fontSize=9, textColor=TEXT_MUTED,
    leading=14, spaceAfter=3)

BULLET = S('bullet',
    fontName='Helvetica', fontSize=9, textColor=TEXT_MUTED,
    leading=13, leftIndent=10, spaceAfter=2)

HIGHLIGHT = S('highlight',
    fontName='Helvetica-Bold', fontSize=9, textColor=TEXT,
    leading=13, leftIndent=10, spaceAfter=2)

CAPTION = S('caption',
    fontName='Helvetica', fontSize=8, textColor=TEXT_DIM,
    alignment=TA_CENTER, spaceAfter=2)

TOOL_LABEL = S('tool_label',
    fontName='Helvetica-Bold', fontSize=8, textColor=GREEN,
    spaceAfter=3)

TIP = S('tip',
    fontName='Helvetica', fontSize=8, textColor=CYAN,
    leading=12, leftIndent=8, spaceAfter=2)


def cell(content_paras, bg=SURFACE, padding=10):
    t = Table([[content_paras]], colWidths=['100%'])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), padding),
        ('BOTTOMPADDING', (0,0), (-1,-1), padding),
        ('LEFTPADDING', (0,0), (-1,-1), padding),
        ('RIGHTPADDING', (0,0), (-1,-1), padding),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t


def step_block(num, title, label_text, bullets, tools=None, tips=None, bg=SURFACE):
    content = [
        Paragraph(label_text.upper(), LABEL),
        Paragraph(f'{num}. {title}', STEP_TITLE),
    ]
    for b in bullets:
        if b.startswith('**'):
            content.append(Paragraph(f'• {b.strip("*")}', HIGHLIGHT))
        else:
            content.append(Paragraph(f'• {b}', BULLET))
    if tools:
        content.append(Spacer(1, 4))
        content.append(Paragraph('TOOLS', TOOL_LABEL))
        for t in tools:
            content.append(Paragraph(f'  {t}', BULLET))
    if tips:
        content.append(Spacer(1, 4))
        for tip in tips:
            content.append(Paragraph(f'💡 {tip}', TIP))
    return cell(content, bg=bg)


def build():
    out = '/Users/sserg/ontology/public/goi-video-guide.pdf'
    doc = SimpleDocTemplate(
        out,
        pagesize=A4,
        leftMargin=13*mm,
        rightMargin=13*mm,
        topMargin=13*mm,
        bottomMargin=13*mm,
        title='Research Paper Video Production Guide — GOI YouTube',
        author='Generative Ontology Induction',
    )

    story = []

    # ── Header ────────────────────────────────────────────────────────────────
    story.append(Paragraph('Research Paper Video Guide', TITLE_STYLE))
    story.append(Paragraph('Generative Ontology Induction — YouTube Channel', SUBTITLE_STYLE))
    story.append(Paragraph(
        'youtube.com/@GenerativeOntologyInduction  ·  ontology.live/goi-video-guide.pdf',
        BADGE_STYLE
    ))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER, spaceAfter=8))

    # ── Intro row ─────────────────────────────────────────────────────────────
    intro_content = [
        Paragraph('WHAT THIS GUIDE COVERS', LABEL),
        Paragraph(
            'A repeatable 8-step workflow for turning a research paper or section into a '
            'polished YouTube video — from concept to publish. Designed for the GOI channel '
            'covering Generative Ontology Induction, knowledge graphs, and AI agent pipelines.',
            BODY
        ),
        Spacer(1, 4),
        Paragraph('TARGET OUTPUT PER VIDEO', LABEL),
        Paragraph('• Runtime: 8–15 min (paper overview) or 3–5 min (concept explainer)', BULLET),
        Paragraph('• Format: Talking head + animated slides + code/graph demos', BULLET),
        Paragraph('• Cadence: 1 video per 2 weeks', BULLET),
        Paragraph('• Audience: AI researchers, ML engineers, ontology practitioners', BULLET),
    ]
    story.append(cell(intro_content, bg=HexColor('#0d1530'), padding=12))
    story.append(Spacer(1, 7))

    # ── Steps row 1: steps 1–3 ────────────────────────────────────────────────
    s1 = step_block(1, 'Pick Topic & Define Angle', 'Planning',
        [
            '**Choose one paper section, concept, or contribution** per video',
            'Decide the angle: tutorial, deep-dive, comparison, or demo',
            'Write a one-sentence hook: "What if you could…" or "Most people don\'t know…"',
            'Map to a keyword (e.g. "ontology induction AI", "knowledge graph LLM")',
            'Check YouTube search volume via TubeBuddy or vidIQ',
        ],
        tools=['TubeBuddy / vidIQ — keyword research', 'Notion / Obsidian — topic backlog'],
        tips=['1 concept = 1 video. Never try to cover a full paper in one video.'],
    )

    s2 = step_block(2, 'Write the Script', 'Scripting',
        [
            '**Hook (0–30 s):** state the problem your paper solves',
            '**Context (30–90 s):** why it matters, who cares',
            '**Core content (3–10 min):** explain method, show graphs/results',
            '**Demo (optional):** live walkthrough on ontology.live',
            '**CTA (last 30 s):** like, subscribe, link to paper PDF',
            'Write for ears, not eyes — short sentences, no jargon without definition',
        ],
        tools=['Claude / ChatGPT — draft from paper abstract', 'Google Docs — script with timestamps'],
        tips=['Read the script aloud. If you stumble, rewrite.'],
        bg=HexColor('#0d1530')
    )

    s3 = step_block(3, 'Create Visual Assets', 'Design',
        [
            '**Slides:** 1 idea per slide, max 20 words, dark theme (#070b14)',
            '**Diagrams:** export from ontology.live — PNG or SVG',
            '**Animations:** use Manim for math, Canva for simple graphics',
            '**B-roll:** screen recordings of ontology.live, code editor',
            '**Thumbnail:** bold text + face + contrast color — test at 120×68px',
        ],
        tools=['Figma / Canva — thumbnail & slides', 'ontology.live — graph exports', 'Manim — math animations'],
        tips=['Match slide colors to channel palette: indigo #6366f1, amber #f59e0b.'],
    )

    row1 = Table([[s1, s2, s3]], colWidths=['33%', '33%', '34%'])
    row1.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(row1)
    story.append(Spacer(1, 6))

    # ── Steps row 2: steps 4–6 ────────────────────────────────────────────────
    s4 = step_block(4, 'Record Audio & Video', 'Recording',
        [
            '**Audio first:** record voiceover clean, then sync video',
            'Use a dynamic mic (SM7B, MV7) — treat the room with blankets',
            'Record in chunks per slide — easier to re-record one section',
            '**Talking head:** eye-level camera, soft key light at 45°',
            'Teleprompter app for script (Teleprompter Premium, BigVu)',
            'Name files: 01_hook.wav, 02_context.wav, etc.',
        ],
        tools=['Audacity / Adobe Audition — audio cleanup', 'OBS Studio — screen capture', 'DaVinci Resolve — video recording'],
        tips=['Mouth clicks? Use Edit > Silence in Audacity. Hiss? Add a noise gate at −40 dB.'],
    )

    s5 = step_block(5, 'Edit the Video', 'Post-Production',
        [
            '**Structure:** audio track first, then place video & slides on top',
            'Cut every pause >0.5 s, every filler word (um, uh, like)',
            '**B-roll rule:** never leave a static slide on screen >8 s',
            'Add lower-thirds: paper title, author name, section label',
            'Color grade: match talking head to dark slide palette',
            'Export: H.264, 1080p60, AAC 320 kbps, for YouTube',
        ],
        tools=['DaVinci Resolve (free) — primary editor', 'Descript — AI transcript-based editing', 'Adobe Premiere — alternative'],
        bg=HexColor('#0d1530'),
        tips=['Use Resolve\'s "Cut" page for speed. Proxy edit if rendering is slow.'],
    )

    s6 = step_block(6, 'Add Captions & Chapters', 'Accessibility',
        [
            'Upload to YouTube → auto-captions → download → fix errors manually',
            'Or use Whisper AI locally: whisper video.mp4 --language en',
            '**Chapters:** add timestamps in description (00:00 Intro, 01:23 Method…)',
            'Chapters must start at 00:00 and have ≥3 entries to activate',
            'Use chapter titles that match your keyword targets',
            'Add cards at 70% and end screen in last 20 s',
        ],
        tools=['OpenAI Whisper — local transcription', 'YouTube Studio — caption editor', 'SubRip (.srt) format'],
        tips=['Captions increase watch time by ~12% and help non-native speakers.'],
    )

    row2 = Table([[s4, s5, s6]], colWidths=['33%', '33%', '34%'])
    row2.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(row2)
    story.append(Spacer(1, 6))

    # ── Steps row 3: steps 7–8 + checklist ───────────────────────────────────
    s7 = step_block(7, 'Write Metadata & Publish', 'Publishing',
        [
            '**Title:** keyword first, then hook — max 60 chars',
            '**Description:** 150-char hook → timestamps → links → tags',
            'Include: paper PDF link, ontology.live, GitHub repo, transcript',
            '**Tags:** 10–15, mix broad (ontology) + specific (GOI ISWC 2025)',
            '**Category:** Science & Technology',
            'Schedule 24 h in advance — post Tuesday–Thursday 10–12 EST',
            'Set thumbnail before publishing — it\'s the #1 click driver',
        ],
        tools=['TubeBuddy — A/B thumbnail test', 'ChatGPT — title & description variants'],
        bg=HexColor('#0d1530'),
        tips=['Never use "clickbait" titles that overpromise — ruins retention.'],
    )

    s8 = step_block(8, 'Promote & Analyze', 'Growth',
        [
            'Post clip (60 s) to LinkedIn + X/Twitter same day',
            'Share in: r/MachineLearning, Semantic Web mailing list, Discord AI servers',
            'Reply to every comment in first 48 h — boosts algorithm',
            '**After 7 days:** check CTR (target >4%), AVD (target >40%)',
            'If CTR <4% → replace thumbnail. If AVD <30% → cut the intro',
            'Track which topics drive most subscribers → double down',
        ],
        tools=['YouTube Studio Analytics', 'LinkedIn + Twitter/X', 'Buffer / Hypefury — scheduling'],
        tips=['One strong video per month beats four weak ones. Quality > cadence.'],
    )

    checklist_content = [
        Paragraph('PRE-PUBLISH CHECKLIST', LABEL),
        Paragraph('□  Script finalized & read aloud', BULLET),
        Paragraph('□  Audio noise-gated, normalized to −14 LUFS', BULLET),
        Paragraph('□  No jump cuts, no dead air >0.5 s', BULLET),
        Paragraph('□  Thumbnail tested at 120×68 px', BULLET),
        Paragraph('□  Captions uploaded & corrected', BULLET),
        Paragraph('□  Chapters added (≥3 timestamps)', BULLET),
        Paragraph('□  Description: hook + timestamps + links', BULLET),
        Paragraph('□  Paper PDF linked in description', BULLET),
        Paragraph('□  Cards + end screen configured', BULLET),
        Paragraph('□  Scheduled (not published immediately)', BULLET),
        Spacer(1, 5),
        Paragraph('PAPER VIDEO TYPES', LABEL),
        Paragraph('• Overview (10–15 min) — full paper summary', BULLET),
        Paragraph('• Concept explainer (3–5 min) — one idea', BULLET),
        Paragraph('• Demo (5–8 min) — live ontology.live walkthrough', BULLET),
        Paragraph('• Comparison (6–10 min) — GOI vs. prior work', BULLET),
    ]
    checklist = cell(checklist_content, bg=SURFACE, padding=10)

    row3 = Table([[s7, s8, checklist]], colWidths=['33%', '33%', '34%'])
    row3.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(row3)
    story.append(Spacer(1, 8))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER, spaceAfter=6))
    story.append(Paragraph(
        'youtube.com/@GenerativeOntologyInduction  ·  ontology.live  ·  contact@ontology.live  ·  © 2026 Pivots Global LLC',
        CAPTION
    ))

    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(BG)
        canvas.rect(0, 0, W, H, fill=1, stroke=0)
        canvas.restoreState()

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'PDF saved to: {out}')


if __name__ == '__main__':
    build()
