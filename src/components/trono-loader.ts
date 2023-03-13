import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('trono-loader')
export class TronoLoader extends LitElement {
  static get styles() {
    return css`
.eq-spinner {
  height: 20px;
  width: 21px;
  transform: rotate(180deg);
}
.eq-spinner:before, .eq-spinner:after, .eq-spinner > i {
  float: left;
  width: 5px;
  height: 20px;
  background: rgb(237, 178, 48);
  margin-left: 3px;
  content: "";
}
.eq-spinner:before {
  margin-left: 0;
}

.eq-spinner:before {
  animation: bounce-3 1s infinite linear;
}
.eq-spinner > i {
  animation: bounce-2 1s infinite linear;
}
.eq-spinner:after {
  animation: bounce-1 1s infinite linear;
}
@keyframes bounce-1 {
  0% { height: 1px }
  16.7% { height: 20px }
  33.4% { height: 20px }
  100% { height: 1px }
}
@keyframes bounce-2 {
  0% { height: 1px }
  16.7% { height: 1px }
  33.4% { height: 20px }
  50% { height: 20px }
  100% { height: 1px }
}
@keyframes bounce-3 {
  0% { height: 1px }
  33.4% { height: 1px }
  50% { height: 20px }
  66.7% { height: 20px }
  100% { height: 1px }
}
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="eq-spinner"><i /></div>
    `;
  }
}
