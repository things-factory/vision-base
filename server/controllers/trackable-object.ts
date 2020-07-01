import { TrackingEvent, TrackableObject, Pose, ROI, TRACKING_EVENT_TYPES } from './vision-types'

const isSamePose = (pose1, pose2) => {
  /* TODO 미세한 변화는 움직이지 않은 것으로 한다. */
  var { x: x1, y: y1, z: z1, u: u1, v: v1, w: w1 } = pose1
  var { x: x2, y: y2, z: z2, u: u2, v: v2, w: w2 } = pose2

  return (
    Math.abs(x1 - x2) < 1 &&
    Math.abs(y1 - y2) < 1 &&
    Math.abs(z1 - z2) < 1 &&
    Math.abs(u1 - u2) < 1 &&
    Math.abs(v1 - v2) < 1 &&
    Math.abs(w1 - w2) < 1
  )
}

export class TrackableObjectImpl implements TrackableObject {
  /**
   * TrackableObject의 id, eg) tag id
   */
  id: string | number
  roi: ROI
  pose: Pose
  /**
   * ROI내 특정 위치에 체류한 시간
   */
  retention: number

  constructor(id) {
    this.id = id
  }

  update(roi, pose) {
    var from = {
      roi: this.roi,
      pose: this.pose,
      retention: this.retention
    }
    var to = {
      roi: roi,
      pose: pose,
      retention: 0
    }

    var moving = true
    var movein = false
    var moveout = false

    if (this.roi !== roi) {
      /* roi가 바뀌었다면 movein/out 중이다 */
      movein = !!roi
      moveout == !!this.roi
    } else {
      moving = !isSamePose(this.pose, pose)
    }

    var events: TrackingEvent[] = []
    moveout &&
      events.push({
        type: TRACKING_EVENT_TYPES.OUT,
        object: this,
        from,
        to
      })

    this.roi = roi
    this.pose = pose
    this.retention = moving ? 0 : this.retention + 1

    movein &&
      events.push({
        type: TRACKING_EVENT_TYPES.IN,
        object: this,
        from,
        to
      })

    this.retention == 1 &&
      events.push({
        type: TRACKING_EVENT_TYPES.STAY,
        object: this,
        from,
        to: {
          ...to,
          retention: 1
        }
      })

    return events
  }

  get state() {
    return this.retention > 1
  }
}
