import type { ExplorationTarget } from '../types/targetTypes'

/**
 * Target candidates are deliberately isolated demonstration data. Screening
 * priority represents a review order, not a probability of mineral discovery.
 */
export const DEMO_TARGETS: ExplorationTarget[] = [
  {
    id: 'GT-001', area: 'Central Dyke', priority: 'High', reviewStatus: 'Review pending', runId: 'GT-RUN-008',
    coordinates: [29.84, -18.36], depositModel: 'Stratiform chromite', screeningMethod: 'Geology-driven rules',
    screeningRank: '1 of 3', confidence: 'Mixed · sources vary', hypothesis: 'Unverified exploration hypothesis',
    evidence: [
      { title: 'Host geology', detail: 'Mapped mafic–ultramafic host units' },
      { title: 'Structural evidence', detail: 'Interpreted geological contacts' },
      { title: 'Occurrence records', detail: 'Historical records near the AOI' },
    ],
  },
  {
    id: 'GT-002', area: 'South Corridor', priority: 'Moderate', reviewStatus: 'In review', runId: 'GT-RUN-008',
    coordinates: [29.59, -20.03], depositModel: 'Stratiform chromite', screeningMethod: 'Geology-driven rules',
    screeningRank: '2 of 3', confidence: 'Moderate · requires field checks', hypothesis: 'Unverified exploration hypothesis',
    evidence: [{ title: 'Host geology', detail: 'Interpreted ultramafic units' }, { title: 'Geochemistry', detail: 'Regional Cr response' }],
  },
  {
    id: 'GT-003', area: 'Northern Sector', priority: 'Moderate', reviewStatus: 'Needs evidence', runId: 'GT-RUN-008',
    coordinates: [30.12, -16.98], depositModel: 'Stratiform chromite', screeningMethod: 'Geology-driven rules',
    screeningRank: '3 of 3', confidence: 'Limited · sparse sampling', hypothesis: 'Unverified exploration hypothesis',
    evidence: [{ title: 'Host geology', detail: 'Mapped mafic–ultramafic units' }],
  },
  {
    id: 'GT-004', area: 'Central West', priority: 'Low', reviewStatus: 'Deferred', runId: 'GT-RUN-007',
    coordinates: [29.51, -19.12], depositModel: 'Stratiform chromite', screeningMethod: 'Geology-driven rules',
    screeningRank: '4 of 4', confidence: 'Low · incomplete sources', hypothesis: 'Unverified exploration hypothesis',
    evidence: [{ title: 'Occurrence records', detail: 'Historical record outside the core AOI' }],
  },
]
