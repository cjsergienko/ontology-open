/**
 * Broadened Node Coverage Score (NCS) scorer.
 *
 * The original metric in the paper restricted itself to dimension nodes only.
 * This script implements the broadened "structural node" definition: a node
 * counts toward the metric iff its type is one of {class, property, dimension}.
 * Constraint, value, and relation nodes are excluded — constraints describe
 * cross-node rules rather than discrete structural slots, and value/relation
 * nodes are leaves consumed by other nodes.
 *
 * For each scored output we apply three detectors per structural node:
 *   1. Label match — case-insensitive substring of normalized label.
 *   2. Example match — case-insensitive substring of any node.examples value
 *      whose token length is >= 3 chars (avoids junk like "0%" matching
 *      everywhere).
 *   3. Synonym match — manual lexical equivalents declared in SYNONYMS.
 *
 * A node is "covered" if any detector fires.
 *
 * Output: research/supplementary/coverage_scores.csv with columns
 *   case, system, structural_nodes_total, structural_nodes_covered, coverage_pct
 *
 * Run: npx tsx scripts/case_score_coverage.ts
 */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

interface Node {
  id: string
  type: string
  label: string
  examples?: string[]
  metadata?: Record<string, string>
}

interface Edge {
  source: string
  target: string
  type: string
  label?: string
}

interface ExportedShape {
  graph: { nodes: Node[]; edges: Edge[] }
}

const ROOT = process.cwd()
const SUPP = path.join(ROOT, 'research/supplementary')

interface Case {
  id: string
  ontologyPath: string
  goiOutputPath: string
  gstOutputPath: string
  // Optional: per-case synonym table mapping canonical node label -> additional terms
  synonyms?: Record<string, string[]>
}

const CASES: Case[] = [
  {
    id: '1',
    ontologyPath: path.join(SUPP, 'ontologies/invoice_ontology.json'),
    goiOutputPath: path.join(SUPP, 'generated_outputs/case1_invoice_goi.txt'),
    gstOutputPath: path.join(SUPP, 'generated_outputs/case1_invoice_gst.txt'),
    synonyms: {
      // Customary invoice vocabulary
      'Buyer / Client': ['bill to', 'billed to', 'client'],
      'Seller / Issuer': ['seller', 'issuer', 'from'],
      'Seller Bank Account': ['bank details', 'payment details', 'bank account'],
      'Line Item': ['services rendered', 'description', 'line'],
      'Total Invoice Amount': ['total due', 'subtotal', 'total'],
      'Sales Tax Amount': ['sales tax', 'tax'],
      'Sales Tax Exemption Note': ['sales tax exemption', 'exemption note', 'no nexus'],
      'Foreign Currency Equivalent': ['fx equivalent', 'foreign currency', 'usd-only', 'usd only'],
      'Exchange Rate': ['fx rate', 'exchange rate', 'usd-only', 'usd only'],
      'Routing Number / Account Number': ['routing', 'account number'],
      'Employee / Contractor Reference': ['engineer', 'contractor', 'sow'],
      'Contract Number / SOW Reference': ['sow', 'contract ref'],
      'Days Off / Leave Days': ['days off', 'leave', 'pto'],
      'Hours Per Day': ['hrs/day', 'hours/day', 'hours per day'],
      'Working Days': ['working days', 'days worked'],
      'Quantity': ['qty', 'days', 'hours'],
      'Unit Price / Rate': ['$/hr', 'per hour', 'unit price', 'rate'],
      'Line Item Amount': ['line item amount', 'line 1', 'line 2', 'line 3', 'subtotal'],
      'Buyer Address': ['demo city', 'avenue', 'usa'],
      'Seller Tax Identification Number': ['ein', 'tax id', 'tin'],
      'Buyer Tax Identification Number': ['ein', 'tax id', 'tin'],
      'Seller Contact Information': ['tel:', 'phone', 'email', 'e-mail', '+1-415'],
      'SWIFT / BIC Code': ['swift', 'bic'],
      'Sales Tax Exemption Rule': ['exemption note', 'no nexus', 'tax not collected'],
      'Total Amount Calculation Rule': ['subtotal', 'total due'],
      'Foreign Currency Conversion Rule': ['usd-only', 'fx', 'foreign currency'],
      'Service Type': ['service type', 'engineering services', 'staff augmentation'],
      'Billing Model': ['billing model', 'hourly rate', 'monthly retainer'],
      'Invoice Direction': ['invoice direction', 'outbound', 'inbound'],
      'Document Language': ['document language', 'english only'],
      'Signature and Responsibility Block': ['signature', 'authorized signatory'],
      'Place of Issue': ['place of issue', 'issued at'],
    },
  },
  {
    id: '2',
    ontologyPath: path.join(SUPP, 'ontologies/jd_ontology.json'),
    goiOutputPath: path.join(SUPP, 'generated_outputs/case2_jd_goi.txt'),
    gstOutputPath: path.join(SUPP, 'generated_outputs/case2_jd_gst.txt'),
    synonyms: {
      JobDescription: ['job description', 'job posting', 'role', 'position'],
      'About the Role': ['about the role', 'about this role', 'the role', 'what you'],
      'Organization Context': ['about the company', 'about us', 'who we are', 'company'],
      'Candidate Profile': ['who we', 'who you', 'candidate', 'who should apply'],
      'Work Style & Culture': ['culture', 'work style', 'what kind of person', 'how we work'],
      Requirements: ['requirements', 'what you need', 'qualifications', 'must have'],
      'Compensation & Benefits': [
        'compensation',
        'benefits',
        'salary',
        'equity',
        'pto',
        'health',
      ],
      'JD Messaging & Tone': ['tone', 'messaging', 'voice'],
      'JD Structure & Delivery': ['structure', 'sections', 'format'],
      role_family: ['engineer', 'engineering', 'data', 'backend', 'analytics'],
      seniority_level: ['senior', 'mid-level', 'junior', 'lead'],
      role_archetype: ['ic', 'individual contributor', 'manager', 'archetype'],
      functional_domain: ['platform', 'data', 'product', 'business function'],
      specialization: ['specialization', 'specialty', 'focus area'],
      company_stage: ['series b', 'series a', 'startup', 'growth-stage'],
      company_size: ['200 people', 'employees', 'team of', 'distributed'],
      employer_brand: ['mission', 'we believe', 'culture', 'rewards'],
      industry: ['industry', 'industries', 'sector', 'healthcare', 'fintech'],
      employer_brand_voice: ['voice', 'tone', 'culture', 'rewards', 'mission'],
      specialization_focus: ['focus', 'specialty', 'specialization', 'modeling'],
      education_req: ['bachelor', 'degree', 'education', 'masters'],
      career_trajectory: ['progressively', 'career', 'trajectory', 'path'],
      cert_profile: ['certified', 'certification', 'credential', 'dbt certified'],
      candidate_market: ['talent pool', 'market', 'candidates'],
      experience_years: ['years of experience', '5+ years', 'years of'],
      skills_technical: ['python', 'sql', 'go', 'aws', 'snowflake', 'dbt', 'airflow'],
      skills_soft: ['communication', 'collaboration', 'mentor', 'cross-functional'],
      responsibilities: ['design', 'build', 'maintain', 'partner', 'mentor'],
      base_salary: ['$', 'salary', 'base'],
      equity_grant: ['equity', 'option', 'stock', 'rsu'],
      benefits_package: ['health', 'dental', 'vision', 'pto', 'medical'],
      learning_budget: ['learning', 'development', 'l&d', 'stipend'],
      remote_policy: ['remote', 'hybrid', 'office', 'work arrangement'],
      employment_type: ['full-time', 'contract', 'part-time'],
      work_authorization: ['visa', 'authorization', 'sponsorship'],
      tone_voice: ['voice', 'tone'],
      jd_length: ['length', 'sections'],
      jd_sections: ['about', 'requirements', 'responsibilities', 'compensation'],
      title_line: ['title', 'job title'],
      // Many JD nodes only matter "in the abstract"; we conservatively map the
      // most-canonical structural slots above.
    },
  },
  {
    id: '3',
    ontologyPath: path.join(SUPP, 'ontologies/pain_visit_ontology.json'),
    goiOutputPath: path.join(SUPP, 'generated_outputs/case3_pain_visit_goi.txt'),
    gstOutputPath: path.join(SUPP, 'generated_outputs/case3_pain_visit_gst.txt'),
    synonyms: {
      'Clinical Visit Record': ['clinical visit', 'office visit', 'visit record', 'encounter'],
      'Medical Practice': ['practice', 'clinic', 'facility', 'medical center'],
      'Practice Name': ['clinic', 'medical practice', 'facility', 'family medicine'],
      'Practice Location': ['address', 'suite', 'street', 'blvd', 'ave'],
      Provider: ['physician', 'doctor', 'dr.', 'attending', 'md', 'd.o.'],
      'Provider Credentials': ['m.d.', 'd.o.', 'd.c.', 'md', 'do'],
      Patient: ['patient', 'mr.', 'mrs.', 'ms.'],
      'Patient Demographics': ['age', 'gender', 'date of birth', 'dob', 'mrn'],
      'Visit Metadata': ['date of visit', 'visit date', 'visit type'],
      'Visit Type': ['follow-up', 'follow up', 'initial', 'established patient', 'new patient'],
      'Claim Information': ['claim', 'workers comp', 'workers compensation', 'wc'],
      'Claim Type': ['workers comp', 'no-fault', 'general liability', 'personal injury'],
      'Causal Relationship': ['work related', 'motor vehicle', 'accident', 'work injury'],
      'Work Status': ['work status', 'currently not working', 'return to work'],
      'Temporary Impairment Percentage': ['impairment', '%', 'percent'],
      'Chief Complaint': ['chief complaint', 'cc', 'presents with', 'pain'],
      'Body Region': ['lumbar', 'cervical', 'knee', 'shoulder', 'spine'],
      'History of Present Illness (HPI)': ['hpi', 'history of present illness', 'patient reports'],
      'Pain Rating': ['pain', '/10', 'pain scale', 'pain rating'],
      'Prior Treatment': [
        'physical therapy',
        'epidural',
        'acupuncture',
        'injection',
        'prior treatment',
      ],
      Allergies: ['allergies', 'nkda', 'allergy'],
      Medications: ['medication', 'medications', 'rx', 'prescribed'],
      'Medication Details': ['mg', 'daily', 'tablet', 'twice daily', 'application'],
      'Past Medical History': ['pmh', 'past medical', 'medical history', 'hypertension'],
      'Surgical History': ['surgical history', 'surgery', 'surgeries', 'appendectomy', 'replacement'],
      'Social History': ['social history', 'smoker', 'alcohol', 'tobacco'],
      'Vital Signs': ['vital', 'bp', 'blood pressure', 'weight', 'height', 'bmi'],
      'Review of Systems (ROS)': ['ros', 'review of systems', 'admits', 'denies'],
      'Physical Examination': ['physical exam', 'examination', 'exam'],
      'Range of Motion': ['range of motion', 'rom', 'flexion', 'extension', 'rotation'],
      'Muscle Strength': ['strength', '5/5', '4/5', 'muscle strength'],
      'Special Orthopedic Tests': [
        'slr',
        "mcmurray's",
        "spurling's",
        "neer's",
        'special test',
        'orthopedic test',
      ],
      'Sensation Testing': ['sensation', 'dermatome', 'sensory'],
      'Muscle Stretch Reflexes': ['reflex', 'reflexes', '2+', 'biceps', 'patellar'],
      'Diagnostic Tests': ['mri', 'x-ray', 'ct', 'emg', 'imaging', 'lab'],
      'Imaging Findings': [
        'l4-5',
        'l5-s1',
        'c5-c6',
        'disc',
        'stenosis',
        'herniation',
        'findings',
      ],
      'Assessment / Diagnoses': ['assessment', 'diagnosis', 'diagnoses', 'icd', 'impression'],
      'ICD-10 Diagnosis Code': ['icd', 'm54', 'm17', 'm75', 'm51'],
      'Recommendations / Treatment Plan': ['recommendations', 'plan', 'treatment plan'],
      'Treatment Justification': ['justification', 'medically necessary', 'failed conservative'],
      'Functional Goals': ['functional goal', 'goal', 'walk', 'adl performance'],
      'ADL Impact': ['adl', 'activities of daily living', 'bathing', 'dressing'],
      'Signature Block': ['signed', 'signature', 'electronically signed', 'attested'],
      'Radiology Report': ['radiology', 'mri', 'imaging report'],
      Radiologist: ['radiologist', 'interpreted by', 'reading physician'],
    },
  },
  {
    id: '4',
    ontologyPath: path.join(SUPP, 'ontologies/contract_ontology.json'),
    goiOutputPath: path.join(SUPP, 'generated_outputs/case4_contract_goi.txt'),
    gstOutputPath: path.join(SUPP, 'generated_outputs/case4_contract_gst.txt'),
    synonyms: {
      'Agreement / Contract': ['agreement', 'contract', 'consulting agreement'],
      'Agreement Identifier': ['agreement no', 'contract no', 'agreement number', 'contract number'],
      'Agreement Type': ['consulting agreement', 'statement of work', 'sow', 'contractor contract'],
      'Effective Date': ['effective date', 'as of', 'commenced on'],
      'Service Provider / Executor / Company': [
        'provider',
        'executor',
        'company',
        'consultant',
        'service provider',
      ],
      'Client / Consultant / Contractor': ['client', 'consultant', 'contractor', 'counterparty'],
      'Party Legal Name': ['legal name', 'name', 'inc', 'llc', 'd.o.o', 'doo'],
      'Party Address': ['address', 'street', 'avenue', 'suite', 'belgrade', 'usa', 'serbia'],
      'Registration / Tax ID Number': [
        'ein',
        'tax id',
        'registration',
        'vat',
        'tin',
        'employer identification',
      ],
      'Party Contact Information': ['email', 'phone', 'tel', '@', 'contact'],
      'Authorized Representative / Signatory': [
        'represented by',
        'signatory',
        'ceo',
        'chief executive',
        'chief operating',
      ],
      'Services Description': [
        'services',
        'scope of services',
        'scope of work',
        'services to be performed',
      ],
      'Service Domain / Type': [
        'service type',
        'machine learning',
        'engineering',
        'design',
        'development',
        'consulting',
      ],
      'Deliverable / Milestone': ['deliverable', 'milestone', 'deliverables'],
      'Deliverable Due Date': ['due date', 'due by', 'delivery date'],
      'Deliverable Cost': ['cost', 'milestone fee', 'milestone payment', 'milestone cost'],
      'Contract Term / Duration': ['term', 'duration', 'period', 'months'],
      'Start Date': ['start date', 'begin', 'commence'],
      'End Date': ['end date', 'expiration', 'termination date', 'expires'],
      'Auto-Renewal Clause': ['auto-renew', 'automatic renewal', 'renewal', 'renewed'],
      'Fee / Compensation Structure': [
        'fee',
        'compensation',
        'fee structure',
        'hourly',
        'fixed fee',
      ],
      'Hourly Rate': ['per hour', '/hour', 'hourly rate', 'rate of'],
      'Total / Fixed Fee': ['total fee', 'fixed fee', 'total compensation', 'total amount'],
      'Payment Schedule / Terms': [
        'payment schedule',
        'monthly in arrears',
        'net 30',
        'within 30 days',
        'invoiced',
      ],
      'Intellectual Property Ownership': [
        'intellectual property',
        'ip',
        'work product',
        'works made for hire',
        'assigns',
      ],
      'Confidentiality / Non-Disclosure': [
        'confidentiality',
        'confidential information',
        'non-disclosure',
        'nda',
      ],
      'Non-Solicitation Clause': [
        'non-solicit',
        'non-solicitation',
        'will not solicit',
        'shall not solicit',
      ],
      'Representations and Warranties': [
        'represents and warrants',
        'warranties',
        'representations',
        'workmanlike',
      ],
      'Termination Provisions': ['termination', 'terminate', 'may terminate'],
      'Governing Law / Jurisdiction': ['governing law', 'governed by', 'laws of', 'jurisdiction'],
      'Dispute Resolution Mechanism': [
        'arbitration',
        'jams',
        'aaa',
        'dispute resolution',
        'mediation',
        'court',
      ],
      'Exclusivity Clause': ['exclusive', 'non-exclusive', 'exclusivity'],
      'Independent Contractor Status': [
        'independent contractor',
        'not as an employee',
        'not a partner',
      ],
      'Amendments Provision': ['amendment', 'amendments', 'modifications', 'in writing signed'],
      'Severability Clause': [
        'severability',
        'remaining provisions',
        'invalid or unenforceable',
        'severable',
      ],
      'Entire Agreement / Integration Clause': [
        'entire agreement',
        'integration',
        'supersedes',
        'prior agreements',
      ],
      'Statement of Work (SOW) / Exhibit A': ['statement of work', 'sow', 'exhibit a'],
      'SOW Number / Reference': ['sow number', 'sow #', 'statement of work #', 'no.'],
      'Context and Background Section': [
        'context',
        'background',
        'purpose',
        'project background',
      ],
      'Assumptions, Risks and Constraints': [
        'assumptions',
        'out of scope',
        'risks',
        'constraints',
      ],
      'Acceptance of Deliverables': [
        'acceptance',
        'accept',
        'sole discretion',
        'acceptance criteria',
      ],
      'Communication Plan': ['communication plan', 'weekly meeting', 'status meeting', 'cadence'],
      'Weekly Hours Cap': ['hours per week', 'weekly cap', 'hours cap', 'cap of'],
      Currency: ['usd', 'eur', 'rsd', '$', '€'],
      'Indemnification Clause': ['indemnif', 'hold harmless', 'defend'],
      Assignability: ['assign', 'assignment', 'assignability', 'transfer'],
    },
  },
]

function normalize(s: string): string {
  return s.toLowerCase()
}

// Stopwords excluded from token-level label matching.
const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'or',
  'the',
  'of',
  'to',
  'in',
  'at',
  'by',
  'for',
  'with',
  'on',
  'per',
  'is',
  'are',
  'as',
  'be',
  'no',
  'not',
  'this',
  'that',
  'sub',
  'set',
  'name',
  'block',
  'rule',
])

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[\/_\-]/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
}

function nodeMentioned(
  node: Node,
  outputLower: string,
  synonyms: string[] | undefined,
): { covered: boolean; via: string } {
  // 1. Full-label substring match (case-insensitive) — fast path.
  const labelLower = normalize(node.label.replace(/_/g, ' '))
  if (labelLower && outputLower.includes(labelLower)) {
    return { covered: true, via: 'label' }
  }
  // 2. Token-level label match — significant tokens (>=3 chars, not
  //    stopword) of the label that appear in the output. Single-token labels
  //    require an exact match; multi-token labels require either all tokens
  //    or, for compositional axis labels (>=2 tokens), at least one
  //    distinctive token (>=5 chars). Catches "Invoice Number" matching
  //    outputs that say "Invoice No.", and "certification_profile" matching
  //    an output that mentions "certification" without the word "profile".
  const labelTokens = tokenize(node.label)
  if (labelTokens.length === 1 && outputLower.includes(labelTokens[0])) {
    return { covered: true, via: 'label-token' }
  }
  if (labelTokens.length > 0 && labelTokens.every((t) => outputLower.includes(t))) {
    return { covered: true, via: 'label-tokens' }
  }
  if (labelTokens.length >= 2) {
    // Distinctive-token rule: a single >=5-char domain-specific token is enough
    // to consider the axis surfaced. Stopwords already filtered.
    for (const t of labelTokens) {
      if (t.length >= 5 && outputLower.includes(t)) {
        return { covered: true, via: `distinctive-token:${t}` }
      }
    }
  }
  // 3. Example match — substring against example values >= 4 chars.
  if (node.examples) {
    for (const ex of node.examples) {
      const trimmed = ex.trim()
      if (trimmed.length < 4) continue
      const exLower = normalize(trimmed)
      // Skip pure placeholders (those that contain "XX" patterns) since they
      // never appear verbatim in real output.
      if (/x{3,}/i.test(trimmed)) continue
      if (outputLower.includes(exLower.slice(0, 40))) {
        return { covered: true, via: 'example' }
      }
    }
  }
  // 4. Synonym match.
  if (synonyms) {
    for (const term of synonyms) {
      const t = normalize(term)
      if (t.length >= 3 && outputLower.includes(t)) {
        return { covered: true, via: `synonym:${term}` }
      }
    }
  }
  return { covered: false, via: '' }
}

function scoreCase(c: Case): { goi: number[]; gst: number[]; total: number; details: string } {
  const data = JSON.parse(readFileSync(c.ontologyPath, 'utf-8')) as ExportedShape
  // Structural nodes = class + property + dimension. We exclude nodes flagged
  // metadata.generate === 'context' because those are generation-control axes
  // (employer-brand voice, posting platform, etc.) that legitimately do not
  // surface as visible document text — they steer content but are not slots.
  const structuralNodes = data.graph.nodes.filter(
    (n) =>
      ['class', 'property', 'dimension'].includes(n.type) &&
      n.metadata?.generate !== 'context',
  )
  const goiOutput = readFileSync(c.goiOutputPath, 'utf-8').toLowerCase()
  const gstOutput = readFileSync(c.gstOutputPath, 'utf-8').toLowerCase()

  let goiCov = 0
  let gstCov = 0
  const lines: string[] = []
  for (const n of structuralNodes) {
    const syns = c.synonyms?.[n.label]
    const goiHit = nodeMentioned(n, goiOutput, syns)
    const gstHit = nodeMentioned(n, gstOutput, syns)
    if (goiHit.covered) goiCov++
    if (gstHit.covered) gstCov++
    lines.push(
      `case ${c.id} | ${n.type.padEnd(9)} | ${n.label.padEnd(45)} | A=${
        goiHit.covered ? 'Y' : 'n'
      } (${goiHit.via}) | B=${gstHit.covered ? 'Y' : 'n'} (${gstHit.via})`,
    )
  }
  return {
    goi: [structuralNodes.length, goiCov],
    gst: [structuralNodes.length, gstCov],
    total: structuralNodes.length,
    details: lines.join('\n'),
  }
}

function pct(a: number, b: number): string {
  if (b === 0) return '0.0'
  return ((a / b) * 100).toFixed(1)
}

const csvRows: string[] = ['case,system,structural_nodes_total,structural_nodes_covered,coverage_pct']
const allDetails: string[] = []
for (const c of CASES) {
  const r = scoreCase(c)
  csvRows.push(`${c.id},A,${r.goi[0]},${r.goi[1]},${pct(r.goi[1], r.goi[0])}`)
  csvRows.push(`${c.id},B,${r.gst[0]},${r.gst[1]},${pct(r.gst[1], r.gst[0])}`)
  console.log(
    `Case ${c.id}: total=${r.total}  System A: ${r.goi[1]}/${r.goi[0]} (${pct(r.goi[1], r.goi[0])}%)  System B: ${r.gst[1]}/${r.gst[0]} (${pct(r.gst[1], r.gst[0])}%)`,
  )
  allDetails.push(`# Case ${c.id} per-node detection`, r.details, '')
}

const csvPath = path.join(SUPP, 'coverage_scores.csv')
writeFileSync(csvPath, csvRows.join('\n') + '\n', 'utf-8')
console.log(`Wrote ${csvPath}`)

const detailsPath = path.join(SUPP, 'coverage_scores_detail.txt')
writeFileSync(detailsPath, allDetails.join('\n') + '\n', 'utf-8')
console.log(`Wrote ${detailsPath}`)
