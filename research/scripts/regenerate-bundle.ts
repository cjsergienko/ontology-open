// Reads each ontology JSON, runs through toFullExportShape, writes back
// with 2-space indent. Used to refresh research/supplementary/ontologies/
// to the dual-view export shape (PR #23) without re-touching the SQLite store.

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { toFullExportShape } from '../../lib/exportFormat'
import type { Ontology } from '../../lib/types'

const FILES = [
  'research/supplementary/ontologies/jd_ontology.json',
  'research/supplementary/ontologies/invoice_ontology.json',
]

for (const rel of FILES) {
  const path = resolve(process.cwd(), rel)
  const raw = JSON.parse(readFileSync(path, 'utf-8')) as Ontology
  // Defensive: if positions missing, leave as-is — toFullExportShape doesn't care.
  const out = toFullExportShape(raw)
  writeFileSync(path, JSON.stringify(out, null, 2) + '\n', 'utf-8')
  console.log(
    `Regenerated ${rel} — ${out.graph.nodes.length} nodes, ` +
      `${out.graph.edges.length} edges, ` +
      `${out.pipeline.promptReady.length} promptReady chars`,
  )
}
