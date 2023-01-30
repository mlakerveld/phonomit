import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: Boolean}) enableBack: boolean = false;

  static get styles() {
    return css`
      header {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-content: center;
        align-items: center;
        background-color: rgba(2, 43, 58, 0.8);
        color: white;
        height: 4em;
        padding-left: 16px;
        padding-top: 12px;

        position: fixed;
        left: env(titlebar-area-x, 0);
        top: env(titlebar-area-y, 0);
        height: env(titlebar-area-height, 50px);
        width: env(titlebar-area-width, 100%);
        -webkit-app-region: drag;
      }

      header a {
        text-decoration: none;
      }

      header h1 {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 26px;
      }

      .trono {
        background-color: #1A6675;
        border-radius: 5px;
        padding: 10px;
        color: #EDB230;
        font-family: 'Aleo', serif;
        font-weight: 400;
      }

      .stream {
        color: #F3F3F4;
        font-family: 'Caveat', handwriting;
        font-weight: 500;
      }

      @media(prefers-color-scheme: light) {
        header {
          color: black;
        }

        nav a {
          color: initial;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <header>
          <a href="/"><h1><span class="trono">TRONO</span><span class="stream">.stream</span></h1></a>
      </header>
    `;
  }
}
