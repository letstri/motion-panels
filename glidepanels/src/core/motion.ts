import type { animate, motionValue } from 'motion'

export interface MotionApi {
  animate: typeof animate
  motionValue: typeof motionValue
}
