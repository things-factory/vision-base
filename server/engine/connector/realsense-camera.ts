import { Connections, Connector } from '@things-factory/integration-base'
import { VisionSensor } from '../../controllers/vision-sensor/vision-sensor-types'

export class RealsenseCamera implements Connector, VisionSensor {
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

  detectRegion(storage) {}

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
