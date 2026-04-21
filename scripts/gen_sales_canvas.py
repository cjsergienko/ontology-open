#!/usr/bin/env python3
"""Generate Lean Sales Canvas PDF for ontology.live"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import KeepTogether

W, H = A4

# ── Palette ──────────────────────────────────────────────────────────────────
BG         = HexColor('#070b14')
SURFACE    = HexColor('#0d1224')
SURFACE2   = HexColor('#111827')
ACCENT     = HexColor('#6366f1')   # indigo
AMBER      = HexColor('#f59e0b')
GREEN      = HexColor('#10b981')
RED        = HexColor('#ef4444')
PURPLE     = HexColor('#8b5cf6')
CYAN       = HexColor('#06b6d4')
TEXT       = HexColor('#f1f5f9')
TEXT_MUTED = HexColor('#94a3b8')
TEXT_DIM   = HexColor('#475569')
BORDER     = HexColor('#1e2a4a')

styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

TITLE_STYLE = S('title',
    fontName='Helvetica-Bold', fontSize=28, textColor=TEXT,
    alignment=TA_CENTER, spaceAfter=4)

SUBTITLE_STYLE = S('subtitle',
    fontName='Helvetica', fontSize=13, textColor=TEXT_MUTED,
    alignment=TA_CENTER, spaceAfter=2)

BADGE_STYLE = S('badge',
    fontName='Helvetica-Bold', fontSize=9, textColor=ACCENT,
    alignment=TA_CENTER, spaceAfter=16)

SECTION_TITLE = S('section_title',
    fontName='Helvetica-Bold', fontSize=11, textColor=AMBER,
    spaceAfter=6, spaceBefore=2)

BODY = S('body',
    fontName='Helvetica', fontSize=9, textColor=TEXT_MUTED,
    leading=14, spaceAfter=3)

BULLET = S('bullet',
    fontName='Helvetica', fontSize=9, textColor=TEXT_MUTED,
    leading=13, leftIndent=10, spaceAfter=2,
    bulletIndent=0)

HIGHLIGHT = S('highlight',
    fontName='Helvetica-Bold', fontSize=9, textColor=TEXT,
    leading=13, leftIndent=10, spaceAfter=2)

CAPTION = S('caption',
    fontName='Helvetica', fontSize=8, textColor=TEXT_DIM,
    alignment=TA_CENTER, spaceAfter=2)

COST_HEAD = S('cost_head',
    fontName='Helvetica-Bold', fontSize=9, textColor=GREEN,
    spaceAfter=4)

LABEL = S('label',
    fontName='Helvetica-Bold', fontSize=7, textColor=ACCENT,
    spaceAfter=3, charSpace=1)


def cell(content_paras, bg=SURFACE, padding=8):
    """Wrap paragraphs in a single-cell table with background."""
    t = Table([[content_paras]], colWidths=['100%'])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('ROUNDEDCORNERS', [6,6,6,6]),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('TOPPADDING', (0,0), (-1,-1), padding),
        ('BOTTOMPADDING', (0,0), (-1,-1), padding),
        ('LEFTPADDING', (0,0), (-1,-1), padding),
        ('RIGHTPADDING', (0,0), (-1,-1), padding),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t


def section(title_text, items, color=AMBER, bg=SURFACE, note=None):
    """Build a canvas section block."""
    content = [Paragraph(title_text.upper(), LABEL)]
    for item in items:
        if item.startswith('**'):
            text = item.strip('*')
            content.append(Paragraph(f'• {text}', HIGHLIGHT))
        else:
            content.append(Paragraph(f'• {item}', BULLET))
    if note:
        content.append(Spacer(1, 4))
        content.append(Paragraph(note, CAPTION))
    return cell(content, bg=bg)


def build_canvas():
    out = '/Users/sserg/Desktop/ontology_live_sales_canvas.pdf'
    doc = SimpleDocTemplate(
        out,
        pagesize=A4,
        leftMargin=14*mm,
        rightMargin=14*mm,
        topMargin=14*mm,
        bottomMargin=14*mm,
        title='Lean Sales Canvas — ontology.live',
        author='Pivots Global LLC',
    )

    story = []

    # ── Header ───────────────────────────────────────────────────────────────
    story.append(Paragraph('ontology.live', TITLE_STYLE))
    story.append(Paragraph('Lean Sales Canvas', SUBTITLE_STYLE))
    story.append(Paragraph('VISUAL ONTOLOGY & KNOWLEDGE GRAPH DESIGNER FOR AI AGENT PIPELINES', BADGE_STYLE))
    story.append(HRFlowable(width='100%', thickness=0.5, color=BORDER, spaceAfter=10))

    # ── Row 1: Problem | Solution | UVP ──────────────────────────────────────
    problem = section('Problem', [
        '**Hard to imagine ontology structure** — no mental model without visuals',
        '**No visual editors for ontologies** — only Protégé (complex, desktop-only)',
        '**Manual YAML/JSON conversion** — error-prone, time-consuming',
        '**No doc-to-ontology service** — engineers build structure from scratch',
        '**LLM pipelines lack grounding** — RAG systems underperform without structured domain knowledge',
        '**Knowledge graph design** requires specialized skills most teams don\'t have',
    ], bg=SURFACE)

    solution = section('Solution', [
        '**Visual drag-and-drop graph editor** — 6 node types, 7 edge types',
        '**AI-powered import** — upload YAML/JSON/Markdown, get a visual graph instantly',
        '**Learn from Documents** — upload examples, AI extracts structure & builds ontology',
        '**One-click export** — YAML or JSON ready for LangGraph / RAG / LLM routers',
        '**5 layout algorithms** — force, spring, tree, circular for any graph shape',
        '**Multi-domain** — hiring, finance, healthcare, legal, any domain',
    ], bg=SURFACE)

    uvp = section('Unique Value Proposition', [
        '**Nobody else does this** — no visual ontology editor built for AI pipelines',
        'Design → import → edit → export in one tool',
        'Convert raw documents into structured ontologies automatically',
        'Ontology becomes the structural backbone for every agent cluster',
        'Bridges the gap between domain experts and LLM engineers',
        '€250/mo entry point vs enterprise Knowledge Graph tools at $10K+/yr',
    ], bg=HexColor('#0d1530'))

    row1 = Table(
        [[problem, solution, uvp]],
        colWidths=['33%', '33%', '34%'],
    )
    row1.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(row1)
    story.append(Spacer(1, 6))

    # ── Row 2: Customer Segments | Channels | Customer Relationships ──────────
    segments = section('Customer Segments', [
        '**AI startups** building LLM agent pipelines (Series A–C)',
        '**Individual AI engineers & researchers** — personal ontology design',
        '**ML platform teams** at mid-size tech companies',
        '**Data scientists** working with knowledge graphs & RAG',
        '**LangGraph / LangChain developers** needing structured domain models',
        '**Ontology consultants** needing a client-facing design tool',
        'Enterprise AI teams structuring internal knowledge bases',
    ], bg=SURFACE)

    channels = section('Channels', [
        '**Direct / Self-Serve** — ontology.live organic sign-up',
        '**AI Communities** — Reddit r/MachineLearning, HuggingFace, Discord',
        '**Content / SEO** — "ontology for AI agents" keyword cluster',
        '**GitHub** — open examples, LangGraph integration demos',
        '**LinkedIn** — targeting ML engineers, AI architects',
        '**Dev newsletters** — TLDR AI, The Batch, Import AI',
        'Recommendations from early enterprise users',
    ], bg=SURFACE)

    relationships = section('Customer Relationships', [
        '**Acquire** — self-serve trial, no CC required',
        '**Activate** — onboarding: import a demo ontology in 60 sec',
        '**Retain** — saved ontologies, version history (Pro)',
        '**Expand** — team seats, API access, larger node limits',
        '**Pro / VIP** — managed relationship, dedicated support',
        '**Custom** — full consulting: Sergei S. designs ontology manually',
    ], bg=SURFACE)

    row2 = Table(
        [[segments, channels, relationships]],
        colWidths=['33%', '33%', '34%'],
    )
    row2.setStyle(TableStyle([
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(row2)
    story.append(Spacer(1, 6))

    # ── Row 3: Key Metrics | Cost Structure | Revenue Streams ─────────────────
    metrics = section('Key Metrics', [
        '**Acquisition** — sign-ups/wk, trial→paid conversion %',
        '**Revenue** — MRR, ARPU, LTV, churn rate',
        '**Product Usage** — ontologies created, nodes/ontology, exports/user',
        '**Operational** — API calls/user, avg response time, uptime %',
        '**Unit Economics** — CAC, LTV:CAC ratio (target >3×)',
        '**Retention** — DAU/MAU ratio, 30/60/90-day retention curves',
    ], bg=SURFACE)

    costs_content = [
        Paragraph('COST STRUCTURE', LABEL),
        Paragraph('Fixed Monthly', COST_HEAD),
        Paragraph('• AWS EC2 t3.large (2vCPU/8GB): ~$60/mo', BULLET),
        Paragraph('• RDS PostgreSQL db.t3.micro: ~$15/mo', BULLET),
        Paragraph('• CloudFront CDN + S3 storage: ~$15/mo', BULLET),
        Paragraph('• Cloudflare (domain + tunnel): ~$10/mo', BULLET),
        Paragraph('• Monitoring / infra tooling: ~$20/mo', BULLET),
        Paragraph('<b>Fixed total: ~$120/mo</b>', HIGHLIGHT),
        Spacer(1, 5),
        Paragraph('Variable (per usage)', COST_HEAD),
        Paragraph('• Import (YAML/MD): ~$0.001–0.015/op', BULLET),
        Paragraph('• Learn from Docs: ~$0.04–0.45/batch', BULLET),
        Paragraph('• 500 ops/mo (Pro tier): ~$20–225/mo', BULLET),
        Spacer(1, 5),
        Paragraph('Break-even', COST_HEAD),
        Paragraph('• 1 Basic subscriber ($250) covers all fixed costs', HIGHLIGHT),
        Paragraph('• 1 Pro subscriber → ~$680 gross margin/mo', HIGHLIGHT),
        Paragraph('• Target GM: 75–85% at scale', BULLET),
    ]
    costs = cell(costs_content, bg=SURFACE)

    revenue_content = [
        Paragraph('REVENUE STREAMS', LABEL),
        Spacer(1, 2),
        Paragraph('Subscriptions (recurring)', COST_HEAD),
        Paragraph('• Basic — €250/mo (5 ontologies, 100 nodes)', BULLET),
        Paragraph('• Pro — €900/mo (50 ontologies, API access)', BULLET),
        Paragraph('• VIP — €1,500/mo (unlimited, on-premise)', BULLET),
        Spacer(1, 5),
        Paragraph('New Inbound Clients', COST_HEAD),
        Paragraph('• AI teams discover via the tool → become consulting clients', BULLET),
        Paragraph('• Ontology consulting: €5K–50K/project', BULLET),
        Paragraph('• Pipeline design & agent architecture services', BULLET),
        Spacer(1, 5),
        Paragraph('Future Streams', COST_HEAD),
        Paragraph('• Ontology marketplace (buy/sell domain ontologies)', BULLET),
        Paragraph('• API access (pay-per-call for LLM integrations)', BULLET),
        Paragraph('• Whitelabel for enterprise AI platforms', BULLET),
        Spacer(1, 5),
        Paragraph('Target MRR at 12 months: €15K–25K', HIGHLIGHT),
    ]
    revenue = cell(revenue_content, bg=HexColor('#0d1530'))

    row3 = Table(
        [[metrics, costs, revenue]],
        colWidths=['33%', '33%', '34%'],
    )
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
        '© 2026 Pivots Global LLC · ontology.live · contact@ontology.live',
        CAPTION
    ))

    # ── Build ─────────────────────────────────────────────────────────────────
    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(BG)
        canvas.rect(0, 0, W, H, fill=1, stroke=0)
        canvas.restoreState()

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'PDF saved to: {out}')


if __name__ == '__main__':
    build_canvas()
