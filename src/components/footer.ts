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
            font-family: 'Aleo', serif;
            font-weight: bold;
        }

        a {
          color: white;
        }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <footer>
        <div></div>
        <span>&#169; trono.stream</span>
        <div>
          <a href="/privacy">Our Privacy Statement</a>
          <a href="/terms">Terms of Use</a>
        </div>
      </footer>
    `;
  }
}
