export type TargetView = 'library' | 'detail' | 'review'
export type TargetPriority = 'High' | 'Moderate' | 'Low'
export type TargetReviewStatus = 'Review pending' | 'In review' | 'Needs evidence' | 'Deferred'

export interface ExplorationTarget {
  id: string
  area: string
  priority: TargetPriority
  reviewStatus: TargetReviewStatus
  runId: string
  coordinates: [number, number]
  depositModel: string
  screeningMethod: string
  screeningRank: string
  confidence: string
  hypothesis: string
  evidence: Array<{ title: string; detail: string }>
}
