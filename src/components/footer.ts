import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('trono-footer')
export class Footer extends LitElement {
  static get styles() {
    return css`
        footer {
            width: 100vw - 20px;
            background-color: rgba(2, 43, 58, 0.8);
            min-height: 3rem;
            padding: 10px;
        }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <footer>
        my foot
      </footer>
    `;
  }
}
