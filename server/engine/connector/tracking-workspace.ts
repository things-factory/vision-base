import { sleep } from '@things-factory/utils'
import { Connections, Connector } from '@things-factory/integration-base'
import { VISION_OBJECT_TYPES } from '../../controllers/vision-types'
import { TrackingEngineImpl } from '../../controllers/tracking-engine'

export class TrackingWorkspace implements Connector {
  async ready(connectionConfigs) {
    await Promise.all(connectionConfigs.map(this.connect))

    Connections.logger.info('tracking-workspace connections are ready')
  }

  async connect(connection) {
    var { name } = connection
    var engine = new TrackingEngineImpl(name)

    Connections.addConnection(connection.name, {
      discriminator: VISION_OBJECT_TYPES.WORKSPACE,
      ...connection,
      engine
    })

    /* IMPROVE-ME 최초 시작시점에 다른 커넥션들이 완료될 시간을 1초 정도 벌어주자. */
    await sleep(1000)
    engine.start({ logger: Connections.logger })

    Connections.logger.info(`tracking-workspace connection(${connection.name}:${connection.endpoint}) is connected`)
  }

  async disconnect(name) {
    var { engine } = Connections.removeConnection(name)
    engine && engine.stop()

    Connections.logger.info(`tracking-workspace connection(${name}) is disconnected`)
  }

  get parameterSpec() {
    return [
      {
        type: 'offset-pose',
        name: 'poseThreshold',
        label: 'pose-threshold'
      }
    ]
  }

  get taskPrefixes() {
    return ['tracking-ws']
  }
}

Connections.registerConnector('tracking-workspace', new TrackingWorkspace())
