import type { Ontology, OntologyNode, OntologyEdge, NodeType, EdgeType } from './types'

/**
 * Cleaned shape for AI/RAG pipeline consumers. Strips:
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

export interface ExportedOntology {
  name: string
  description: string
  domain: string
  nodes: ExportedOntologyNode[]
  edges: ExportedOntologyEdge[]
}

export function toExportShape(ontology: Ontology): ExportedOntology {
  const nodes: ExportedOntologyNode[] = ontology.nodes.map((n: OntologyNode) => {
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
  })

  const edges: ExportedOntologyEdge[] = ontology.edges.map((e: OntologyEdge) => ({
    source: e.source,
    target: e.target,
    label: e.label,
    type: e.type,
  }))

  return {
    name: ontology.name,
    description: ontology.description,
    domain: ontology.domain,
    nodes,
    edges,
  }
}
