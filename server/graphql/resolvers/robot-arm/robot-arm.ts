import { ROBOTICS_OBJECT_TYPES } from '../../../controllers/robotics-types'
import { Connections } from '@things-factory/integration-base'

export const robotArmResolver = {
  async robotArm(_: any, { name }, context: any) {
    var connection = Connections.getConnection(name)
    if (!connection || connection.discriminator !== ROBOTICS_OBJECT_TYPES.ROBOT_ARM) {
      throw Error(`RobotArm '${name}' Not Found`)
    }

    var { markerOffset, toolOffset } = connection.params || {}

    return {
      ...connection,
      markerOffset,
      toolOffset
    }
  }
}
