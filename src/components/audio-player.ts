import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('trono-audio-player')
export class AudioPlayer extends LitElement {
  static get styles() {
    return css`
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      audio player
    `;
  }
}
