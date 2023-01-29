import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
@customElement('trono-select-device')
export class SelectDevice extends LitElement {
  static get styles() {
    return css`

    `;
  }

  availableDevices: {id: string, label: string}[] = [];

  constructor() {
    super();
    navigator.mediaDevices.enumerateDevices().then((d) => this.gotDevices(d));
  }

  gotDevices(mediaDevices: MediaDeviceInfo[]) {
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'audioinput') {
        this.availableDevices.push({id: mediaDevice.deviceId, label: mediaDevice.label});
      }
    });
    this.requestUpdate();
    }

  render() {
    return html`
        <sl-select label="Select one">
            ${this.availableDevices.map((device) =>
                html`<sl-option value="${device.id}">${device.label}</sl-option>`
                )}
        </sl-select>
    `;
  }
}
