import type { ComponentType, MutableRefObject } from 'react'
import type { SourceProvenance } from '../../tools/provenance'

/**
 * A chamber owns the entire temple space, not a widget inside it.
 *
 * There is no locomotion in the current architecture. Changing rooms means the
 * temple reconfigures around a stationary practitioner through ChamberDirector.
 */
export type ChamberId = 'sanctum' | 'cell' | 'monad' | 'chapel'

export type ChamberProps = {
  /** Materialisation, 0 → 1. Read inside useFrame; do not mirror per frame in React state. */
  morphRef: MutableRefObject<number>
  /** Existing reactive ritual pulse, spikes to 1 on significant events. */
  ritualImpulseRef: MutableRefObject<number>
  /** True only when this chamber is fully presented and interactive. */
  active: boolean
}

export type ChamberKind = 'generative-sanctum' | 'authored-instrument'

export type ChamberPreviewArtifact =
  | 'solar-forge'
  | 'permutation-axis'
  | 'monas-construction'
  | 'chapter-tree'

export type ChamberCapability =
  | 'gemini'
  | 'comfyui'
  | 'archive'
  | 'offline-tool'
  | 'breath-pacing'
  | 'spatial-axis'
  | 'source-reading'
  | 'deterministic-oracle'

export type Chamber = {
  id: ChamberId
  name: string
  purpose: string
  seal: string
  accent: string
  /** Verified instrument identity rendered inside its architectural station. */
  previewArtifact: ChamberPreviewArtifact

  /**
   * The Sanctum is the generative magical workstation. Specialized chambers are
   * authored knowledge/practice instruments whose source layer is deterministic
   * and whose generative interpretation, if later added, must remain separate.
   */
  kind: ChamberKind

  /** Runtime/service expectations used by future capability and offline gates. */
  capabilities: readonly ChamberCapability[]

  /** Whether the chamber remains complete without network services. */
  offline: 'full' | 'partial'

  /** Coarse standalone-XR budget category for regression review. */
  performanceClass: 'light' | 'moderate'

  /** Source/provenance contract for authored instruments. */
  source?: SourceProvenance

  /** The room shell: architecture, lighting, atmosphere. */
  Architecture?: ComponentType<ChamberProps>
  /** The interactive instrument at the work zone. */
  Instrument?: ComponentType<ChamberProps>
}
