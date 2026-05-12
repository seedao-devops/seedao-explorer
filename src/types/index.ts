// ===== Community =====
export interface Community {
  id: string
  name: string
  values: string[]
  manifesto: string
  tags: string[]
  founders: string[]
  admins: string[]
  treasury: Treasury
  links: Record<string, string>
  created_at: number
  updated_at: number
  event_count: number
  people_count: number
  key_projects: string[]
  governance: Governance
}

export interface Treasury {
  currency: string
  balance: number
  policy: string
}

export interface Governance {
  model: string
  key_components: string[]
  principles: string[]
}

// ===== Event =====
export interface Event {
  id: string
  type: string
  initiator: string
  co_creators: string[]
  participants: string[]
  metadata: EventMetadata
  artifacts: Artifact[]
  external: ExternalRef
  timestamp: number
}

export interface EventMetadata {
  title: string
  description: string
  source_url: string
  published_by: string
  tags: string[]
}

export interface Artifact {
  type: string
  title: string
  url: string
  format: string
}

export interface ExternalRef {
  platform: string
  original_url: string
}

// ===== Person =====
export interface Person {
  id: string
  profile: Record<string, unknown>
  skills: string[]
  interests: string[]
  links: Record<string, string>
  works_input: unknown[]
  event_refs: EventRef[]
  external_inputs: unknown[]
}

export interface EventRef {
  event_id: string
  role: 'initiator' | 'co_creator'
  type: string
  timestamp: number
}

// ===== State =====
export interface CommunityState {
  co_presence: number
  emergence: number
  xiaoyao: number
  people_count: number
  event_count: number
  edge_count: number
  individual_xiaoyao: Record<string, number>
}

// ===== Graph =====
export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  stats: GraphStats
}

export interface GraphNode {
  id: string
  label: string
  type: 'person' | 'event'
  [key: string]: unknown
}

export interface GraphEdge {
  source: string
  target: string
  relationship: string
}

export interface GraphStats {
  node_count: number
  edge_count: number
}
