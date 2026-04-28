import type { Ontology, OntologyNode, OntologyEdge, NodeType, EdgeType } from './types'

/**
 * Cleaned graph shape for round-trip / power users. Strips:
 *  - ontology-level: id, createdAt, updatedAt (DB-internal)
 *  - per-node: position (React Flow UI layout, useless for RAG)
 *  - per-edge: id (UUID, redundant — edges are identified by source/target/type)
 *
 * Re-import remains lossless: the import endpoint auto-layouts missing positions
 * via lib/layout.ts and re-generates edge UUIDs.
 */
export interface ExportedOntologyNode {
  id: string
  type: NodeType
  label: string
  description: string
  semantics?: string
  examples?: string[]
  constraints?: string[]
  metadata?: Record<string, string>
}

export interface ExportedOntologyEdge {
  source: string
  target: string
  label: string
  type: EdgeType
}

export interface ExportedGraph {
  nodes: ExportedOntologyNode[]
  edges: ExportedOntologyEdge[]
}

export interface ExportedOntologyMeta {
  name: string
  description: string
  domain: string
}

// ---------- Pipeline (denormalized) view ----------

export interface PipelineProperty {
  id: string
  label: string
  description: string
  examples?: string[]
}

export interface PipelineRelation {
  type: Extract<EdgeType, 'relates_to' | 'part_of'>
  target: string
  label: string
}

export interface PipelineClass {
  id: string
  label: string
  description: string
  parent: string | null
  properties: PipelineProperty[]
  relations: PipelineRelation[]
  examples?: string[]
}

export interface PipelineDimension {
  id: string
  label: string
  description: string
  values: string[]
}

export interface PipelineConstraint {
  id: string
  label: string
  description: string
  appliesTo: string[]
}

export interface PipelineView {
  classes: PipelineClass[]
  dimensions: PipelineDimension[]
  constraints: PipelineConstraint[]
  promptReady: string
}

export interface FullExportShape {
  ontology: ExportedOntologyMeta
  graph: ExportedGraph
  pipeline: PipelineView
}

// ---------- Helpers ----------

function toCleanNode(n: OntologyNode): ExportedOntologyNode {
  const cleaned: ExportedOntologyNode = {
    id: n.id,
    type: n.type,
    label: n.label,
    description: n.description,
  }
  if (n.semantics !== undefined) cleaned.semantics = n.semantics
  if (n.examples !== undefined) cleaned.examples = n.examples
  if (n.constraints !== undefined) cleaned.constraints = n.constraints
  if (n.metadata !== undefined) cleaned.metadata = n.metadata
  return cleaned
}

function toCleanEdge(e: OntologyEdge): ExportedOntologyEdge {
  return {
    source: e.source,
    target: e.target,
    label: e.label,
    type: e.type,
  }
}

/**
 * Build the cleaned graph shape (PR 1's output, kept for round-trip / power users).
 */
export function toGraphShape(ontology: Ontology): ExportedGraph {
  return {
    nodes: ontology.nodes.map(toCleanNode),
    edges: ontology.edges.map(toCleanEdge),
  }
}

/**
 * Denormalize the graph into a pipeline-friendly view: classes with their
 * properties/relations/parents resolved, dimensions with their values inlined,
 * constraints with their target classes listed.
 */
export function buildPipelineView(ontology: Ontology): PipelineView {
  const nodeById = new Map<string, OntologyNode>()
  for (const n of ontology.nodes) nodeById.set(n.id, n)

  // Index outgoing edges by source.
  const outgoingBySource = new Map<string, OntologyEdge[]>()
  for (const e of ontology.edges) {
    const list = outgoingBySource.get(e.source)
    if (list) list.push(e)
    else outgoingBySource.set(e.source, [e])
  }

  const labelOf = (id: string): string | null => nodeById.get(id)?.label ?? null

  const classes: PipelineClass[] = []
  const dimensions: PipelineDimension[] = []
  const constraints: PipelineConstraint[] = []

  for (const node of ontology.nodes) {
    const outgoing = outgoingBySource.get(node.id) ?? []

    if (node.type === 'class') {
      let parent: string | null = null
      const properties: PipelineProperty[] = []
      const relations: PipelineRelation[] = []

      for (const e of outgoing) {
        if (e.type === 'is_a') {
          const lbl = labelOf(e.target)
          if (lbl) parent = lbl
        } else if (e.type === 'has_property') {
          const target = nodeById.get(e.target)
          if (target) {
            const prop: PipelineProperty = {
              id: target.id,
              label: target.label,
              description: target.description,
            }
            if (target.examples !== undefined) prop.examples = target.examples
            properties.push(prop)
          }
        } else if (e.type === 'relates_to' || e.type === 'part_of') {
          const targetLabel = labelOf(e.target)
          if (targetLabel) {
            relations.push({
              type: e.type,
              target: targetLabel,
              label: e.label || (e.type === 'part_of' ? 'part of' : 'relates to'),
            })
          }
        }
      }

      const cls: PipelineClass = {
        id: node.id,
        label: node.label,
        description: node.description,
        parent,
        properties,
        relations,
      }
      if (node.examples !== undefined && node.examples.length > 0) cls.examples = node.examples
      classes.push(cls)
    } else if (node.type === 'dimension') {
      const values: string[] = []
      for (const e of outgoing) {
        if (e.type === 'has_value') {
          const lbl = labelOf(e.target)
          if (lbl) values.push(lbl)
        }
      }
      dimensions.push({
        id: node.id,
        label: node.label,
        description: node.description,
        values,
      })
    } else if (node.type === 'constraint') {
      const appliesTo: string[] = []
      for (const e of outgoing) {
        if (e.type === 'constrains') {
          const lbl = labelOf(e.target)
          if (lbl) appliesTo.push(lbl)
        }
      }
      constraints.push({
        id: node.id,
        label: node.label,
        description: node.description,
        appliesTo,
      })
    }
  }

  const promptReady = renderPromptReady(ontology, { classes, dimensions, constraints })

  return { classes, dimensions, constraints, promptReady }
}

/**
 * Render the ontology as a system-prompt-ready markdown block. Skips empty
 * sections. Intended for direct injection into LLM system prompts.
 */
export function renderPromptReady(
  ontology: Pick<Ontology, 'name' | 'description' | 'domain'>,
  pipeline: Pick<PipelineView, 'classes' | 'dimensions' | 'constraints'>,
): string {
  const lines: string[] = []
  lines.push(`# ${ontology.name}`)
  lines.push('')
  if (ontology.description) {
    lines.push(ontology.description)
    lines.push('')
  }
  if (ontology.domain) {
    lines.push(`**Domain:** ${ontology.domain}`)
    lines.push('')
  }

  if (pipeline.classes.length > 0) {
    lines.push('## Classes')
    lines.push('')
    for (const cls of pipeline.classes) {
      lines.push(`### ${cls.label}`)
      if (cls.description) lines.push(cls.description)
      if (cls.parent) lines.push(`**Is a:** ${cls.parent}`)
      lines.push('')

      if (cls.properties.length > 0) {
        lines.push('**Properties:**')
        for (const p of cls.properties) {
          const desc = p.description ? `: ${p.description}` : ''
          lines.push(`- ${p.label}${desc}`)
          if (p.examples && p.examples.length > 0) {
            lines.push(`  Examples: ${p.examples.join(', ')}`)
          }
        }
        lines.push('')
      }

      if (cls.relations.length > 0) {
        lines.push('**Relations:**')
        for (const r of cls.relations) {
          lines.push(`- ${r.label} → ${r.target}`)
        }
        lines.push('')
      }

      if (cls.examples && cls.examples.length > 0) {
        lines.push('**Examples:**')
        for (const ex of cls.examples) {
          lines.push(`- ${ex}`)
        }
        lines.push('')
      }
    }
  }

  if (pipeline.dimensions.length > 0) {
    lines.push('## Dimensions')
    lines.push('')
    for (const dim of pipeline.dimensions) {
      lines.push(`### ${dim.label}`)
      if (dim.description) lines.push(dim.description)
      if (dim.values.length > 0) {
        lines.push(`**Values:** ${dim.values.join(', ')}`)
      }
      lines.push('')
    }
  }

  if (pipeline.constraints.length > 0) {
    lines.push('## Constraints')
    lines.push('')
    for (const c of pipeline.constraints) {
      const scope = c.appliesTo.length > 0 ? ` (${c.appliesTo.join(', ')})` : ''
      const desc = c.description ? `: ${c.description}` : ''
      lines.push(`- **${c.label}**${scope}${desc}`)
    }
    lines.push('')
  }

  // Trim trailing blank lines for predictability.
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  return lines.join('\n')
}

/**
 * Top-level export shape: ontology metadata + clean graph + denormalized pipeline view.
 */
export function toFullExportShape(ontology: Ontology): FullExportShape {
  return {
    ontology: {
      name: ontology.name,
      description: ontology.description,
      domain: ontology.domain,
    },
    graph: toGraphShape(ontology),
    pipeline: buildPipelineView(ontology),
  }
}
