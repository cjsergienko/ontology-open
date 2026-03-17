import dagre from '@dagrejs/dagre'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import type { Node, Edge } from '@xyflow/react'
import type { OntologyNode } from './types'

const NODE_WIDTH = 200
const NODE_HEIGHT = 60
const COLLISION_RADIUS = Math.sqrt(NODE_WIDTH ** 2 + NODE_HEIGHT ** 2) / 2 + 20

export type LayoutKind = 'force' | 'tree-tb' | 'tree-lr' | 'circular'

export const LAYOUT_OPTIONS: { kind: LayoutKind; label: string; description: string }[] = [
  { kind: 'force',    label: 'Force',      description: 'Physics simulation — main entity at center' },
  { kind: 'tree-tb',  label: 'Tree ↓',     description: 'Hierarchical top-to-bottom' },
  { kind: 'tree-lr',  label: 'Tree →',     description: 'Hierarchical left-to-right' },
  { kind: 'circular', label: 'Circular',   description: 'Concentric rings by node type' },
]

// ── Force-directed ────────────────────────────────────────────────────────────

interface SimNode { id: string; x: number; y: number; fx?: number | null; fy?: number | null }
interface SimLink { source: string; target: string }

function highestDegree(nodes: Node[], edges: Edge[]): string | null {
  const deg = new Map<string, number>()
  for (const n of nodes) deg.set(n.id, 0)
  for (const e of edges) {
    deg.set(e.source, (deg.get(e.source) ?? 0) + 1)
    deg.set(e.target, (deg.get(e.target) ?? 0) + 1)
  }
  let best: string | null = null, bestDeg = -1
  for (const [id, d] of deg) { if (d > bestDeg) { bestDeg = d; best = id } }
  return best
}

function forceLayout(nodes: Node[], edges: Edge[]): Node[] {
  const mainId = highestDegree(nodes, edges)
  const simNodes: SimNode[] = nodes.map(n => ({
    id: n.id, x: 0, y: 0,
    fx: n.id === mainId ? 0 : null,
    fy: n.id === mainId ? 0 : null,
  }))
  const simLinks: SimLink[] = edges
    .filter(e => nodes.some(n => n.id === e.source) && nodes.some(n => n.id === e.target))
    .map(e => ({ source: e.source, target: e.target }))

  forceSimulation(simNodes as never)
    .force('link', forceLink(simLinks as never).id((d: unknown) => (d as SimNode).id).distance(180).strength(0.5))
    .force('charge', forceManyBody().strength(-600))
    .force('center', forceCenter(0, 0))
    .force('collide', forceCollide(COLLISION_RADIUS))
    .stop()
    .tick(300)

  const pos = new Map(simNodes.map(n => [n.id, { x: n.x, y: n.y }]))
  return nodes.map(n => ({ ...n, position: { x: (pos.get(n.id)?.x ?? 0) - NODE_WIDTH / 2, y: (pos.get(n.id)?.y ?? 0) - NODE_HEIGHT / 2 } }))
}

// ── Dagre hierarchical ────────────────────────────────────────────────────────

function dagreLayout(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR'): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100, marginx: 40, marginy: 40 })
  for (const n of nodes) g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  for (const e of edges) g.setEdge(e.source, e.target)
  dagre.layout(g)
  return nodes.map(n => {
    const { x, y } = g.node(n.id)
    return { ...n, position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 } }
  })
}

// ── Circular (concentric rings by type) ───────────────────────────────────────

const TYPE_RING: Record<string, number> = {
  class: 0, dimension: 1, relation: 2, property: 3, constraint: 4, value: 5,
}

function circularLayout(nodes: Node[], _edges: Edge[]): Node[] {
  const rings = new Map<number, Node[]>()
  for (const n of nodes) {
    const ring = TYPE_RING[(n.data as unknown as OntologyNode)?.type ?? 'class'] ?? 3
    if (!rings.has(ring)) rings.set(ring, [])
    rings.get(ring)!.push(n)
  }
  const result: Node[] = []
  for (const [ring, rNodes] of [...rings.entries()].sort(([a], [b]) => a - b)) {
    const minR = 220, perNode = 260
    const r = Math.max(minR + ring * 200, (rNodes.length * perNode) / (2 * Math.PI))
    const step = (2 * Math.PI) / rNodes.length
    rNodes.forEach((n, i) => {
      const a = step * i + ring * 0.3
      result.push({ ...n, position: { x: r * Math.cos(a) - NODE_WIDTH / 2, y: r * Math.sin(a) - NODE_HEIGHT / 2 } })
    })
  }
  return result
}

// ── Public entry point ────────────────────────────────────────────────────────

export function applyLayout(nodes: Node[], edges: Edge[], kind: LayoutKind): Node[] {
  if (nodes.length === 0) return nodes
  switch (kind) {
    case 'force':    return forceLayout(nodes, edges)
    case 'tree-tb':  return dagreLayout(nodes, edges, 'TB')
    case 'tree-lr':  return dagreLayout(nodes, edges, 'LR')
    case 'circular': return circularLayout(nodes, edges)
  }
}
