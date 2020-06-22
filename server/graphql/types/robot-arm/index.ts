import { RobotArm } from './robot-arm'
import { RobotArmList } from './robot-arm-list'
import { PoseInput } from './pose-input'

export const Mutation = `
  updateRobotArmPose (
    name: String!
    pose: PoseInput!
  ): RobotArm
`

export const Query = `
  robotArms(filters: [Filter], pagination: Pagination, sortings: [Sorting]): RobotArmList
  robotArm(name: String!): RobotArm
  robotArmPose(name: String!): Pose
`

export const Types = [PoseInput, RobotArm, RobotArmList]
