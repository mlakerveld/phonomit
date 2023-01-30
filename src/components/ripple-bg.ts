import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('trono-ripple-bg')
export class RippleBg extends LitElement {
  static get styles() {
    return css`
        .container {
            position: absolute;
            top: 0;
            left: 0;
            background: radial-gradient(circle at 250px 250px, rgb(2, 43, 58) 60%, rgb(5, 31, 41));
            min-height: 100vh;
            min-width: 100vw;
            overflow: hidden;
            z-index: -999;
        }
        .container .box {
            width: 50vw;
            height: 4em;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container .box span {
            position: absolute;
            box-sizing: border-box;
            border: 1px solid #1a66758d;
            border-radius: 50%;
            animation: animate 8s ease-out infinite;
            animation-delay: calc(2s * var(--i));
        }
        @keyframes animate {
            0%{
                opacity: 0;
                width: 0px;
                height: 0px;
            }
            1%{
                opacity: 1;
            }
            50%{
                opacity: 1;
            }
            100%{
                width: 100vw;
                height: 100vw;
                opacity: 0;
            }
        }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
        <div class="container">
            <div class="box">
                <span style="--i:0;"></span>
                <span style="--i:1;"></span>
                <span style="--i:2;"></span>
            </div>
        </div>
    `;
  }
}
