/**
 * 이 클래스는 realsense-camera 의 설정을 위한 에디터로 동작한다.
 */

import { LitElement, html, css } from 'lit-element'
import { i18next, localize } from '@things-factory/i18n-base'

import { CameraClient } from '../camera/camera-client'

import '@material/mwc-icon'
import '@material/mwc-button'

export class CameraCalibrationPopup extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          display: flex;
          flex-direction: column;

          align-items: stretch;
          background-color: #fff;

          width: var(--overlay-center-normal-width, 50%);
          height: var(--overlay-center-normal-height, 50%);
        }

        content {
          flex: 1;

          display: flex;
          flex-direction: row;

          overflow: auto;
        }

        [settings] {
          flex: 2;

          padding: 20px;

          overflow-y: auto;
          overflow-x: none;
        }

        label {
          display: block;
        }

        mwc-slider {
          display: block;
        }

        [stream] {
          flex: 3;

          margin: auto;
        }

        .button-container {
          display: flex;
          margin-left: auto;
        }

        canvas {
          display: block;
          width: 90%;

          margin: auto;
          border: 3px solid #73ad21;
          padding: 10px;
        }
      `
    ]
  }

  static get properties() {
    return {
      value: Object
    }
  }

  disconnectedCallback() {
    this.webcamClient.disconnect()
  }

  firstUpdated() {
    var device = '0'
    var canvas = this.renderRoot.querySelector('canvas')
    var context = canvas.getContext('2d')
    var count = 0

    this.webcamClient = new CameraClient(3001, 'webcam', device, {}, data => {
      if (count++ == 0) {
        var { width, height } = JSON.parse(data)
        canvas.width = width
        canvas.height = height

        return
      }

      var image = new Image()
      image.src = 'data:image/jpeg;base64,' + data
      image.onload = () => {
        context.drawImage(image, 0, 0)
        URL.revokeObjectURL(data)
      }
    })

    this.webcamClient.connect()
  }

  render() {
    var json = JSON.stringify(this.value, null, 2)

    return html`
      <content>
        <div settings>
          <mwc-button label="Take Snapshot" icon="wallpaper"></mwc-button>
          <mwc-button label="Reset" icon="flip_camera_android"></mwc-button>
          <mwc-button label="Compute" icon="exposure"></mwc-button>
        </div>

        <div stream>
          <canvas></canvas>
        </div>
      </content>

      <div class="button-container">
        <mwc-button @click=${this.oncancel.bind(this)}>${i18next.t('button.cancel')}</mwc-button>
        <mwc-button @click=${this.onconfirm.bind(this)}>${i18next.t('button.confirm')}</mwc-button>
      </div>
    `
  }

  onchange(e) {
    e.stopPropagation()

    /* 
      주의 : 이 팝업 템플릿은 layout 모듈에 의해서 render 되므로, 
      layout의 구성에 변화가 발생하면, 다시 render된다.
      이 팝업이 떠 있는 상태에서, 또 다른 팝업이 뜨는 경우도 layout 구성의 변화를 야기한다. (overlay의 갯수의 증가)
      이 경우 value, options, confirmCallback 등 클로져를 사용한 것들이 초기 바인딩된 값으로 다시 바인딩되게 되는데,
      만약, 템플릿 내부에서 이들 속성의 레퍼런스가 변화했다면, 원래 상태로 되돌아가는 현상이 발생하게 된다.
      따라서, 가급적 이들 속성의 레퍼런스를 변화시키지 않는 것이 좋다.
      (이 팝업 클래스를 템플릿으로 사용한 곳의 코드를 참조하세요.)
      => 
      이런 이유로, Object.assign(...)을 사용하였다.
    */
    if (!this.value) {
      this.value = {}
    }

    for (let key in this.value) {
      delete this.value[key]
    }
    Object.assign(this.value, e.detail)
  }

  oncancel(e) {
    history.back()
  }

  onconfirm(e) {
    this.confirmCallback && this.confirmCallback(this.value ? JSON.stringify(this.value) : '')
    history.back()
  }
}

customElements.define('camera-calibration-popup', CameraCalibrationPopup)