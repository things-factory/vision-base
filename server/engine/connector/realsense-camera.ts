import { Connections, Connector } from '@things-factory/integration-base'
import { Matrix, ROI, TrackingCamera } from '../../controllers/vision-types'

export class RealsenseCamera implements Connector, TrackingCamera {
  cameraMatrix: Matrix
  handEyeMatrix: Matrix
  rois: ROI[]

  async ready(connectionConfigs) {
    await Promise.all(connectionConfigs.map(this.connect))

    Connections.logger.info('realsense-camera connections are ready')
  }

  async connect(connection) {
    var { params } = connection

    Connections.addConnection(connection.name, {
      ...connection,
      params
    })

    Connections.logger.info(`realsense-camera connection(${connection.name}:${connection.endpoint}) is connected`)
  }

  async disconnect(name) {
    Connections.removeConnection(name)

    Connections.logger.info(`realsense-camera connection(${name}) is disconnected`)
  }

  trace(storage) {}
  capture() {}
  configure() {}

  get parameterSpec() {
    return [
      {
        type: 'string',
        label: 'device',
        name: 'device'
      },
      {
        type: 'realsense-camera-setting',
        label: 'setting',
        name: 'setting'
      },
      {
        type: 'realsense-camera-calibration',
        label: 'calibration',
        name: 'calibration'
      },
      {
        type: 'camera-roi',
        label: 'roi',
        name: 'roi'
      }
    ]
  }

  get taskPrefixes() {
    return ['realsense']
  }
}

Connections.registerConnector('realsense-camera', new RealsenseCamera())
