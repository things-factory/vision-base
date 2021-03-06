import { sleep } from '@things-factory/utils'
import { Connections, TaskRegistry } from '@things-factory/integration-base'
import { getTrackingWorkspace } from './get-tracking-workspace'

function getObjectState(objectId) {
  var workspace = getTrackingWorkspace()
  if (!workspace) {
    /* TODO workspace가 없는 경우와, object가 detect되지 않은 상태에 대한 구분처리가 필요하다. */
    return {}
  }
  var { engine } = workspace
  var { trackingStorage } = engine

  return trackingStorage.getObjectState(objectId)
}

const isValidPose = pose => {
  if (!pose) {
    return false
  }

  var { x, y, z, u, v, w } = pose
  return ([x, y, z, u, v, w].findIndex(x => isNaN(x) || x === null || x === '') === -1)
}

async function TrackableObjectWaitForMove(step, { root, data, logger }) {
  var { name: stepName, connection, params } = step
  var { duration = 1000 } = params || {}

  var object = Connections.getConnection(connection) || {}
  if (!object) {
    throw new Error(`no connection : ${connection}`)
  }

  var { endpoint: objectId } = object

  var lastStatus = data[stepName]

  if (!lastStatus) {
    lastStatus = getObjectState(objectId)
  }

  var { movedAt: oldMovedAt } = lastStatus

  while (true) {
    let state = root.getState()
    if (state == 1 /* STARTED */) {
      let recentStatus = getObjectState(objectId)
      let { pose, retention: newRetention, movedAt: newMovedAt } = recentStatus

      if (newMovedAt !== oldMovedAt && newRetention > 0 && isValidPose(pose)) {
        lastStatus = recentStatus

        break
      }

      await sleep(Number(duration))
    } else if (state == 2 /* PAUSED */) {
      await sleep(Number(duration))
    } else {
      throw new Error('scenario stopped unexpectedly')
    }
  }

  return {
    data: lastStatus
  }
}

TrackableObjectWaitForMove.parameterSpec = [
  {
    type: 'number',
    name: 'duration',
    label: 'duration',
    placeholder: 'milli-seconds'
  }
]

TaskRegistry.registerTaskHandler('trackable-object-wait-for-move', TrackableObjectWaitForMove)
