# Ontology Builder

A visual web tool for designing ontologies, taxonomies, and knowledge graphs. Supports creating ontologies manually, importing existing ontology files, or generating them automatically from example documents using AI.

## Install

**Requirements:** Node.js >= 20, npm

```bash
cd /Users/sserg/ontology
npm install
```

**Environment variable** (required for AI features):

```bash
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local
```

## Run

```bash
# Development (hot reload)
npm run dev -- --port 3900

# Or via PM2 (production)
pm2 restart ontology-builder
pm2 logs ontology-builder
```

App runs at **http://localhost:3900** (or https://hiringaihelp.com via Cloudflare tunnel).

## Usage

### Create an ontology manually

1. Open the app → click **New Ontology**
2. Enter a name, description, and domain
3. Use the graph editor to add nodes and edges:
   - **Node types:** `class`, `property`, `value`, `dimension`, `relation`, `constraint`
   - **Edge types:** `is_a`, `has_property`, `has_value`, `relates_to`, `part_of`, `constrains`, `instance_of`
4. Click a node/edge to edit it in the right panel

### Import from an ontology file

Upload an existing ontology in any format — JSON, YAML, OWL, RDF, Turtle, Markdown, or plain text. Claude AI converts it into the internal graph format automatically.

1. Click **Import Ontology** on the home page
2. Paste or upload your ontology file content
3. The AI parses it and creates a visual graph

**Supported input formats:** JSON · YAML · OWL/XML · RDF/Turtle · Markdown · Plain text descriptions

### Generate from example documents

Upload one or more example documents of the same type (job descriptions, contracts, medical records, etc.). Claude reverse-engineers the generative ontology — the schema behind the document type — so it can be used to generate new documents from a prompt.

1. Click **Generate from Files** on the home page
2. Upload your example documents (multiple files supported)
3. The AI extracts the structural ontology and builds the graph

## Data Storage

Ontologies are saved as JSON files in `data/ontologies/{uuid}.json`. This directory is not gitignored — data persists between restarts.

```json
{
  "id": "uuid",
  "name": "...",
  "domain": "hiring",
  "nodes": [...],
  "edges": [...]
}
```

## Tech Stack

Next.js 16 · React Flow · TypeScript · Tailwind CSS v4 · Claude API (Anthropic)
