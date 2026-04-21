#!/usr/bin/env python3
"""GOI YouTube Series — readable production guide PDF"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

W, H = A4

# ── Palette (readable / document-style) ──────────────────────────────────────
BG       = HexColor('#ffffff')
INK      = HexColor('#111827')   # near-black body text
INK2     = HexColor('#374151')   # secondary text
MUTED    = HexColor('#6b7280')   # captions, labels
ACCENT   = HexColor('#4f46e5')   # indigo — headings, numbers
RULE     = HexColor('#e5e7eb')   # horizontal rules
BOX_BG   = HexColor('#f8fafc')   # step box bg
BOX_BD   = HexColor('#e2e8f0')   # step box border
DONE_BG  = HexColor('#f0fdf4')   # completed video bg
DONE_BD  = HexColor('#86efac')
NOTE_BG  = HexColor('#eff6ff')   # note/tip boxes
NOTE_BD  = HexColor('#93c5fd')
YT_BG    = HexColor('#fefce8')   # youtube description box
YT_BD    = HexColor('#fde047')

def S(name, **kw):
    return ParagraphStyle(name, **kw)

# Typography
H1     = S('h1', fontName='Helvetica-Bold', fontSize=20, textColor=ACCENT,
           spaceAfter=4, spaceBefore=0, leading=26)
H2     = S('h2', fontName='Helvetica-Bold', fontSize=13, textColor=ACCENT,
           spaceAfter=6, spaceBefore=14, leading=18)
H3     = S('h3', fontName='Helvetica-Bold', fontSize=10, textColor=INK,
           spaceAfter=4, spaceBefore=8, leading=14)
BODY   = S('body', fontName='Helvetica', fontSize=9, textColor=INK2,
           leading=14, spaceAfter=3)
STEP   = S('step', fontName='Helvetica-Bold', fontSize=9, textColor=ACCENT,
           leading=14, spaceAfter=2)
BULL   = S('bull', fontName='Helvetica', fontSize=9, textColor=INK2,
           leading=14, leftIndent=12, spaceAfter=2)
BOLD_B = S('boldb', fontName='Helvetica-Bold', fontSize=9, textColor=INK,
           leading=14, leftIndent=12, spaceAfter=2)
LABEL  = S('lbl', fontName='Helvetica-Bold', fontSize=7, textColor=MUTED,
           spaceAfter=3, charSpace=0.8, leading=10)
CAP    = S('cap', fontName='Helvetica', fontSize=8, textColor=MUTED,
           alignment=TA_CENTER, spaceAfter=2, leading=11)
YT_T   = S('ytt', fontName='Helvetica-Bold', fontSize=9, textColor=INK,
           spaceAfter=3, leading=13)
YT_B   = S('ytb', fontName='Helvetica', fontSize=8, textColor=INK2,
           leading=13, spaceAfter=2)
CODE   = S('code', fontName='Courier', fontSize=8, textColor=HexColor('#1e3a5f'),
           leading=13, leftIndent=8, spaceAfter=2)
INTRO  = S('intro', fontName='Helvetica', fontSize=10, textColor=INK2,
           leading=15, spaceAfter=4)
VID_N  = S('vidn', fontName='Helvetica-Bold', fontSize=28, textColor=ACCENT,
           leading=32, spaceAfter=0, alignment=TA_CENTER)
VID_ST = S('vidst', fontName='Helvetica-Bold', fontSize=7, textColor=white,
           leading=10, alignment=TA_CENTER, spaceAfter=0)


def ruled_box(paras, bg=BOX_BG, border=BOX_BD, pad=8):
    t = Table([[paras]], colWidths=['100%'])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('BOX',        (0,0), (-1,-1), 0.8, border),
        ('TOPPADDING',    (0,0), (-1,-1), pad),
        ('BOTTOMPADDING', (0,0), (-1,-1), pad),
        ('LEFTPADDING',   (0,0), (-1,-1), pad+2),
        ('RIGHTPADDING',  (0,0), (-1,-1), pad),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
    ]))
    return t


def yt_box(title_text, description_text):
    content = [
        Paragraph('YOUTUBE TITLE', LABEL),
        Paragraph(title_text, YT_T),
        Spacer(1, 5),
        Paragraph('YOUTUBE DESCRIPTION  (paste as-is)', LABEL),
    ]
    for line in description_text.strip().split('\n'):
        content.append(Paragraph(line if line.strip() else ' ', YT_B))
    return ruled_box(content, bg=YT_BG, border=YT_BD, pad=10)


def step_box(steps):
    """steps = list of (num, action, detail) tuples"""
    content = [Paragraph('STEP-BY-STEP CLICKTHROUGH', LABEL)]
    for num, action, detail in steps:
        content.append(Paragraph(f'Step {num} — {action}', STEP))
        content.append(Paragraph(detail, BULL))
    return ruled_box(content, bg=BOX_BG, border=BOX_BD, pad=10)


def note_box(text):
    return ruled_box([Paragraph(f'&#9432; {text}', BODY)], bg=NOTE_BG, border=NOTE_BD, pad=8)


def video_header(num, status, title, runtime, gap):
    status_color = HexColor('#16a34a') if status == 'DONE' else HexColor('#d97706') if status == 'NEXT' else MUTED
    num_cell = Paragraph(str(num), VID_N)
    status_p  = Paragraph(status, S('_', fontName='Helvetica-Bold', fontSize=7,
                                    textColor=status_color, leading=10))
    left = Table([[num_cell], [status_p]], colWidths=[18*mm])
    left.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    right_content = [
        Paragraph(title, H2),
        Paragraph(f'{runtime}  ·  Research gap: {gap}', BODY),
    ]
    right = Table([[right_content]], colWidths=['100%'])
    right.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    header = Table([[left, right]], colWidths=[20*mm, None])
    header.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    bg = DONE_BG if status == 'DONE' else BG
    bd = DONE_BD if status == 'DONE' else RULE
    return ruled_box([header], bg=bg, border=bd, pad=10)


def build():
    out = '/Users/sserg/ontology/public/goi-video-plan.pdf'
    doc = SimpleDocTemplate(
        out, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm,
        topMargin=16*mm, bottomMargin=16*mm,
        title='GOI YouTube Series — Production Guide',
        author='Sergei Sergienko / Pivots Global',
    )

    story = []

    # ── Cover ─────────────────────────────────────────────────────────────────
    story.append(Paragraph('GOI YouTube Series', H1))
    story.append(Paragraph('Production Guide — Step-by-Step Clickthrough + Titles & Descriptions', BODY))
    story.append(HRFlowable(width='100%', thickness=0.8, color=ACCENT, spaceAfter=10))
    story.append(Paragraph(
        'This guide covers 5 videos for the <b>@GenerativeOntologyInduction</b> channel. '
        'Each video showcases one novel contribution of the GOI paper vs. the existing literature. '
        'For every video you get: a ready-to-paste YouTube title and description, '
        'and a step-by-step clickthrough of exactly what to open, click, and show on screen.',
        INTRO
    ))

    summary_rows = [
        ['#', 'Title', 'Status', 'Runtime'],
        ['1', 'Generative Ontology Induction from Documents', 'DONE', '8–12 min'],
        ['2', 'The Typed Graph: 6 Nodes & 7 Edges Explained', 'NEXT', '6–9 min'],
        ['3', 'Node Coverage Score: A Better Ontology Metric', 'Planned', '8–10 min'],
        ['4', 'One-Click Export to a Real AI Pipeline', 'Planned', '8–10 min'],
        ['5', 'Same Tool, 3 Completely Different Domains', 'Planned', '10–12 min'],
    ]
    tbl = Table(summary_rows, colWidths=[8*mm, 100*mm, 24*mm, 22*mm])
    tbl.setStyle(TableStyle([
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,-1), 8),
        ('TEXTCOLOR',  (0,0), (-1,0), ACCENT),
        ('TEXTCOLOR',  (0,1), (-1,-1), INK2),
        ('BACKGROUND', (0,0), (-1,0), BOX_BG),
        ('BACKGROUND', (0,1), (-1,1), DONE_BG),
        ('ROWBACKGROUNDS', (0,2), (-1,-1), [white, BOX_BG]),
        ('GRID',       (0,0), (-1,-1), 0.5, RULE),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING',   (0,0), (-1,-1), 6),
        ('RIGHTPADDING',  (0,0), (-1,-1), 6),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 6))
    story.append(note_box(
        'Before recording any video: open ontology.live, sign in, and have a pre-built ontology '
        'ready with at least 12 nodes. Use the Hiring Ontology demo — it has all 6 node types visible.'
    ))

    # ══════════════════════════════════════════════════════════════════════════
    # VIDEO 1
    # ══════════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(video_header(1, 'DONE', 'Generative Ontology Induction from Documents',
        '8–12 min · Screen recording + voiceover',
        'Cross-document canonicalization without domain rules'))

    story.append(yt_box(
        'How AI Reverse-Engineers Any Document\'s Structure — Generative Ontology Induction',
        '''What if you could give an AI a pile of documents and get back the structural blueprint that governs them all — automatically?

That's Generative Ontology Induction (GOI). No predefined schema. No domain rules. Just documents in, typed knowledge graph out.

In this video I walk through:
→ What "generative" ontology means vs. standard entity extraction
→ How GOI discovers recurring structure across multiple documents
→ A live demo: uploading job descriptions and watching the schema emerge
→ The typed graph output — 6 node types, 7 edge types

📄 Paper (ISWC 2025): https://ontology.live/goi-paper.pdf
🔧 Try it free: https://ontology.live
💻 GitHub: https://github.com/cjsergienko/ontology-open

00:00 The problem — why ontology engineering is still manual
02:00 What is a generative ontology?
04:30 Live demo — uploading documents
07:00 Exploring the induced graph
09:30 Export to YAML

#ontology #knowledgegraph #LLM #AI #semanticweb #ISWC2025'''
    ))

    story.append(Paragraph('This video is already recorded. Notes below for reference only.', BODY))
    story.append(step_box([
        (1, 'Open dashboard', 'Go to ontology.live → sign in → you are on the Dashboard (ontology list).'),
        (2, 'Click "+ New Ontology"', 'The 3-tab modal opens. Click the "Learn from Documents" tab (third tab, FilesIcon).'),
        (3, 'Upload 3–5 job description files', 'Drag-and-drop 3–5 PDF or text files of the same document type (e.g. job descriptions). Show the file list appearing with sizes.'),
        (4, 'Name the ontology', 'Type "Hiring Ontology" in the name field. Click "Analyze Documents".'),
        (5, 'Show the streaming', 'The modal shows a live elapsed timer. Let it run — narrate what GOI is doing: reading all docs, finding recurring structure, canonicalizing nodes.'),
        (6, 'Graph appears', 'The editor opens. Zoom out to show the full graph. Pan around — point out the cluster of node types.'),
        (7, 'Identify node types aloud', 'Click one node of each color. Show the right panel label (class / property / dimension / etc).'),
        (8, 'Switch layouts', 'Click the layout buttons in the toolbar: Spring → Force → Tree (top-bottom) → Circular. Show how the graph restructures.'),
        (9, 'Export', 'Click the Download button (top toolbar) → choose YAML. Open the file in a text editor and scroll through it on screen.'),
    ]))

    # ══════════════════════════════════════════════════════════════════════════
    # VIDEO 2
    # ══════════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(video_header(2, 'NEXT', 'The Typed Graph: 6 Nodes & 7 Edges Explained',
        '6–9 min · Tool walkthrough + slides',
        'No standardized typed graph representation exists in the literature'))

    story.append(yt_box(
        'Why Knowledge Graphs Need Types — 6 Node Types & 7 Edge Types in GOI',
        '''Every knowledge graph paper gives you triples: subject → predicate → object.
But triples don't tell you *what kind of thing* each node is. Is it a core concept? A property? A constraint? An enumerated value?

GOI introduces a universal typed graph with 6 node types and 7 edge types — the first standardized taxonomy for induced ontologies.

In this video I walk through every type, explain what it captures, and show why this matters for AI pipelines.

→ class: the core concept of a document type
→ property: an attribute or field the class carries
→ dimension: an axis of variation (the most important type no one else names)
→ value: an enumerated or example value
→ relation: a named relationship between classes
→ constraint: a rule that governs valid instances

📄 Paper (ISWC 2025): https://ontology.live/goi-paper.pdf
🔧 Try it free: https://ontology.live
💻 GitHub: https://github.com/cjsergienko/ontology-open

00:00 Why flat triples fail
01:30 Node type 1 — class
02:30 Node type 2 — property
03:15 Node type 3 — dimension (key insight)
04:15 Node types 4–6 — value, relation, constraint
05:30 The 7 edge types and what they mean for pipelines
07:30 Why this matters for RAG and LangGraph

#ontology #knowledgegraph #LLM #semanticweb #AI #RAG #LangGraph'''
    ))

    story.append(step_box([
        (1, 'Open the Hiring Ontology', 'Go to ontology.live → Dashboard → click the Hiring Ontology you built in Video 1. The graph editor opens.'),
        (2, 'Switch to Tree (top-bottom) layout', 'Click the Tree↓ layout button in the toolbar. This gives a clean hierarchy that\'s easy to read on screen.'),
        (3, 'Zoom to the class node', 'Find the top-level class node (gold/yellow color, Crown icon). Click it. The right panel shows: Type = class, label, description. Read it aloud.'),
        (4, 'Walk property nodes', 'Click 2–3 property nodes (blue, Layers icon). Show the panel: these are attributes like "job_title", "salary_range". Explain: every document of this type has these.'),
        (5, 'Highlight a dimension node', 'Click a dimension node (purple, Zap icon — e.g. "seniority_level" or "employment_type"). This is the key insight: dimensions are axes of variation. No other tool names these explicitly.'),
        (6, 'Show value nodes', 'Click value nodes attached to a dimension (gray, Box icon — e.g. "junior", "senior", "lead"). Explain: these are the valid values for that dimension.'),
        (7, 'Show a constraint node', 'Click any constraint node (red, Filter icon). Read the rule aloud — e.g. "salary must be positive integer". Explain: constraints make the ontology a usable generation spec.'),
        (8, 'Click an edge', 'Click the edge line between two nodes. The right panel shows the edge type label (has_property, is_a, constrains, etc.). Walk through 3–4 edge types.'),
        (9, 'Show the export', 'Click Download → YAML. Scroll to a dimension node block in the YAML. Show how the type field is explicit in the export — pipelines can read it directly.'),
        (10, 'Closing shot', 'Zoom out to show the full graph. Pause 3 seconds. End screen.'),
    ]))

    story.append(note_box(
        'KEY TALKING POINT: Dimension nodes are the most novel type. No competitor names them. '
        'iText2KG, AutoClusRE, OntoKGen all output flat typed nodes — they don\'t distinguish '
        '"property" from "axis of variation". That distinction is what makes GOI useful as a '
        'generation blueprint rather than just a description.'
    ))

    # ══════════════════════════════════════════════════════════════════════════
    # VIDEO 3
    # ══════════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(video_header(3, 'PLANNED', 'Node Coverage Score: A Better Ontology Metric',
        '8–10 min · Slides + live demo',
        'Token-level metrics cannot measure structural completeness of induced schemas'))

    story.append(yt_box(
        'F1 Score Is Lying About Your Ontology — Introducing Node Coverage Score',
        '''Standard metrics like F1, precision, and recall were designed for extraction tasks.
But if your ontology is meant to be a *generation blueprint* — a spec that an LLM uses to produce new documents — those metrics tell you almost nothing.

I introduce the Node Coverage Score: the percentage of dimension nodes in an induced ontology that appear in LLM-generated outputs.

High F1 + low coverage = your ontology is structurally incomplete.
High coverage = your ontology actually works as a generation spec.

In this video:
→ Why F1 fails for ontology evaluation
→ What Node Coverage Score measures and how to compute it
→ Live example: inducing a hiring ontology and measuring its coverage
→ Comparison: two ontologies with similar F1 but very different coverage

📄 Paper (ISWC 2025): https://ontology.live/goi-paper.pdf
🔧 Try it free: https://ontology.live
💻 GitHub: https://github.com/cjsergienko/ontology-open

00:00 The evaluation problem
02:00 What F1 misses
03:30 Node Coverage Score — definition
05:00 Live demo — inducing and measuring
07:30 High vs low coverage comparison
09:00 How to use this metric in your own work

#ontology #evaluation #LLM #knowledgegraph #AI #semanticweb #ISWC2025'''
    ))

    story.append(step_box([
        (1, 'Set up two ontologies', 'Before recording: have two versions of the same ontology saved — one "rich" (many dimension nodes, high coverage) and one "thin" (few nodes, low coverage).'),
        (2, 'Open the rich Hiring Ontology', 'Dashboard → click the rich ontology. Count the dimension nodes visible in the graph — say the number aloud (e.g. "12 dimension nodes").'),
        (3, 'Export to YAML', 'Download → YAML. Open in a text editor. Paste the YAML into a Claude or ChatGPT prompt: "Generate a job description for a Senior Backend Engineer using this ontology as the structural spec."'),
        (4, 'Show the generated output', 'Paste the LLM output on screen. Go through it dimension-by-dimension. Count which dimension nodes appear in the output. E.g. "seniority_level ✓, employment_type ✓, salary_range ✓, visa_requirement ✗". Tally the score.'),
        (5, 'Calculate coverage on screen', 'Show the math: "10 out of 12 dimension nodes appeared → Coverage Score = 83%". Write it in large text.'),
        (6, 'Switch to the thin ontology', 'Dashboard → open the thin ontology. Same process: export YAML → paste into LLM → count dimension nodes in output.'),
        (7, 'Compare scores side by side', 'Show: Thin ontology — F1: 88%, Coverage: 41%. Rich ontology — F1: 85%, Coverage: 83%. The thin ontology has higher F1 but is clearly worse as a generation spec.'),
        (8, 'Zoom out to the graph', 'Return to the rich ontology editor. Zoom out. Point at the dimension nodes: "These are the nodes that matter. If the LLM generating from your ontology hits all of these — your ontology is doing its job."'),
        (9, 'Closing', 'Summarize: Coverage Score is a proxy for ontology usefulness, not just extraction accuracy. Link to paper.'),
    ]))

    story.append(note_box(
        'Film this video close to your ISWC submission date — it\'s the most academic-facing video '
        'and will attract citations from researchers. Mention the paper section number (Section 4) on screen.'
    ))

    # ══════════════════════════════════════════════════════════════════════════
    # VIDEO 4
    # ══════════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(video_header(4, 'PLANNED', 'One-Click Export to a Real AI Pipeline',
        '8–10 min · Live coding demo',
        'No research tool offers pipeline-ready export as a first-class feature'))

    story.append(yt_box(
        'From Ontology to LangGraph Agent in 3 Minutes — GOI Export Demo',
        '''Every ontology tool stops at the graph.
You get a visualization, maybe a Neo4j dump — and then you're on your own to connect it to your pipeline.

GOI exports pipeline-ready YAML and JSON with one click. No parsing. No conversion. Paste it straight into your LangGraph or RAG prompt.

In this video I show the full path:
→ Induce an ontology from documents on ontology.live
→ Export to YAML in one click
→ Use the YAML as a structured context in a LangGraph agent
→ The agent reasons with the schema — no hallucination about structure

📄 Paper (ISWC 2025): https://ontology.live/goi-paper.pdf
🔧 Try it free: https://ontology.live
💻 GitHub: https://github.com/cjsergienko/ontology-open

00:00 The last-mile problem
01:30 Export YAML from ontology.live
03:00 Inspect the export — it's already readable
04:30 Paste into LangGraph system prompt
06:00 Run the agent — watch it follow the schema
08:00 Compare: what you'd do manually with Protégé output

#ontology #LangGraph #RAG #LLM #knowledgegraph #AI #agentic #ISWC2025'''
    ))

    story.append(step_box([
        (1, 'Open the Hiring Ontology in editor', 'ontology.live → Dashboard → Hiring Ontology.'),
        (2, 'Click Download → YAML', 'Show the download dialog. Click YAML. File saves. Open it in VS Code. Let the audience see the full structure — scroll slowly.'),
        (3, 'Point out the structure', 'Pause on a dimension block. Read it aloud: "seniority_level, type: dimension, values: [junior, mid, senior, lead]". Say: "This is machine-readable and human-readable at the same time."'),
        (4, 'Open a Python file / Jupyter notebook', 'Have a simple LangGraph or plain Claude API script ready. Show the system prompt that starts with the YAML content.'),
        (5, 'Show the prompt', 'The prompt reads: "You are a hiring assistant. Use this ontology as the structural specification for all outputs: [YAML pasted here]. Generate a job description for a Senior Backend Engineer."'),
        (6, 'Run the script', 'Execute it on screen. Show the streaming output. The LLM produces structured content that follows the ontology dimensions one by one.'),
        (7, 'Annotate the output', 'Go through the output. Highlight where each dimension appears: "Here\'s seniority_level — Senior. Here\'s employment_type — Full-time. Here\'s tech_stack — it followed the constraint to list 4–6 technologies."'),
        (8, 'Show what Protégé gives you instead', 'Open a sample OWL/RDF export from Protégé (or just show it on a slide). Contrast: complex XML namespaces, requires an OWL parser to consume. Not pasteable into a prompt.'),
        (9, 'Try JSON export too', 'Back in ontology.live — Download → JSON. Open it. "Same data, JSON format — for when you need to parse it programmatically."'),
        (10, 'Closing', 'Return to the graph view. "One click from this — to a working agent. That\'s the goal."'),
    ]))

    story.append(note_box(
        'This is your highest-traffic video — developers search for "LangGraph ontology" and "RAG structured schema". '
        'Make sure the LangGraph/Claude API code is clean and correct before recording. '
        'Consider publishing the script to GitHub and linking it in the description.'
    ))

    # ══════════════════════════════════════════════════════════════════════════
    # VIDEO 5
    # ══════════════════════════════════════════════════════════════════════════
    story.append(PageBreak())
    story.append(video_header(5, 'PLANNED', 'Same Tool, 3 Completely Different Domains',
        '10–12 min · 3-domain live demo',
        'Every competitor requires domain rules, seed ontologies, or fine-tuning'))

    story.append(yt_box(
        'I Used the Same AI Tool on 3 Completely Different Domains — Here\'s What Happened',
        '''Most ontology tools are built for one domain.
You want to use them on something else? Rewrite the rules. Fine-tune the model. Start over.

GOI is domain-agnostic by design. I ran the exact same system — same prompt, same tool, zero changes — on three completely different document types.

The system figured out the structure of each one. No hints. No domain rules.

Domains tested:
→ Job descriptions (hiring domain)
→ Financial reports (structured data, tables, numbers)
→ Lease agreements (legal domain, constraints-heavy)

📄 Paper (ISWC 2025): https://ontology.live/goi-paper.pdf
🔧 Try it free: https://ontology.live
💻 GitHub: https://github.com/cjsergienko/ontology-open

00:00 The domain problem in ontology tools
01:30 Domain 1 — Job descriptions
04:00 Domain 2 — Financial reports
06:30 Domain 3 — Legal contracts
09:00 Side-by-side comparison of all 3 graphs
10:30 What this means for your AI pipeline

#ontology #domainagnostic #LLM #knowledgegraph #AI #semanticweb #ISWC2025'''
    ))

    story.append(Paragraph(
        'PREPARATION: Before recording, run GOI on all 3 domains and save the ontologies. '
        'Make sure each has at least 10 nodes and uses different dominant node types.',
        S('prep', fontName='Helvetica-Bold', fontSize=8, textColor=HexColor('#92400e'),
          leading=12, spaceAfter=6)
    ))

    story.append(step_box([
        (1, 'Start at Dashboard — show 3 ontologies', 'Dashboard shows 3 saved ontologies: "Hiring Ontology", "Financial Reports Ontology", "Lease Agreement Ontology". Briefly show the list.'),
        (2, 'Open Hiring Ontology', 'Click it. Spring layout. Say the node count aloud: "28 nodes, mostly class and dimension nodes at the top — this domain is concept-rich."'),
        (3, 'Highlight the dominant pattern', 'Zoom in on the dimension cluster. "Hiring documents vary along axes: seniority, employment type, location, tech stack. GOI found all of these automatically."'),
        (4, 'Back to Dashboard → open Financial Reports Ontology', 'Click the second ontology. Compare immediately: "Notice — completely different graph topology. More property and value nodes. Financial documents are data-dense — lots of numeric fields."'),
        (5, 'Walk the financial graph', 'Click 2–3 property nodes (revenue, EPS, net_income). Click constraint nodes — "Financial docs have strict numeric constraints that GOI discovered just from reading the documents."'),
        (6, 'Switch to Tree layout for financial', 'Click Tree (top-bottom) layout. Show the hierarchy: the financial class at root, data dimensions branching down.'),
        (7, 'Back to Dashboard → open Lease Agreement Ontology', 'Click the third. "Legal documents. Completely different again — constraint-heavy." Show the count of constraint nodes vs the other two.'),
        (8, 'Walk the legal graph', 'Click constraint nodes: "lease_term must be integer months", "deposit must not exceed 2x monthly_rent". These constraints were extracted from real lease language.'),
        (9, 'Side-by-side comparison on screen', 'Open three browser windows or show 3 screenshots. Read the node type breakdown for each: "Hiring: 8 dimensions, 3 constraints. Financial: 4 dimensions, 6 properties, 2 constraints. Legal: 3 dimensions, 9 constraints." Same tool — radically different structure.'),
        (10, 'Export all three', 'Click Download → YAML on each. Open three YAML files. Show they have different shapes — different top-level keys, different depth. "One exporter — three usable pipeline specs."'),
        (11, 'Closing', 'Return to the Dashboard list. "Three domains. Zero domain-specific rules. That\'s what domain-agnostic means."'),
    ]))

    story.append(note_box(
        'Use real documents for all 3 domains — even simple ones. Authenticity matters. '
        'For financial reports, use a public company 10-Q (SEC filing). '
        'For lease agreements, use any standard residential lease template. '
        'Reuse the Job Description clips from Video 1 for the hiring section to save recording time.'
    ))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width='100%', thickness=0.5, color=RULE, spaceAfter=6))
    story.append(Paragraph(
        'youtube.com/@GenerativeOntologyInduction  ·  ontology.live  ·  '
        'paper: ontology.live/goi-paper.pdf  ·  © 2026 Pivots Global LLC',
        CAP
    ))

    def on_page(canvas, doc):
        # white background
        canvas.saveState()
        canvas.setFillColor(BG)
        canvas.rect(0, 0, W, H, fill=1, stroke=0)
        canvas.restoreState()
        # page number
        canvas.setFont('Helvetica', 7)
        canvas.setFillColor(MUTED)
        canvas.drawCentredString(W / 2, 8*mm, f'{doc.page}')

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'Saved: {out}')


if __name__ == '__main__':
    build()
