import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import './pages/app-home/app-home';
import './pages/app-listener/app-listener';
import './components/header';
import './components/footer';
import './components/ripple-bg';
import './styles/global.css';
import { setBasePath } from '@shoelace-style/shoelace';

@customElement('app-index')
export class AppIndex extends LitElement {
  static get styles() {
    return css`
      trono-footer {
        margin-top: auto
      }

      main {
        padding-left: 16px;
        padding-right: 16px;
        padding-bottom: 16px;
      }

      #routerOutlet > * {
        width: 100% !important;
      }

      #routerOutlet > .leaving {
        animation: 160ms fadeOut ease-in-out;
      }

      #routerOutlet > .entering {
        animation: 160ms fadeIn linear;
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }

        to {
          opacity: 0;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0.2;
        }

        to {
          opacity: 1;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  firstUpdated() {
    setBasePath("/assets/shoelace")

    const router = new Router(this.shadowRoot?.querySelector('#routerOutlet'));
    router.setRoutes([
      {
        path: (import.meta as any).env.BASE_URL,
        animate: true,
        children: [
          { path: '', component: 'app-home' },
          { path: 'broadcaster/:channel?', component: 'app-broadcaster',
          action: async () => {
            await import('./pages/app-broadcaster/app-broadcaster.js');
          },},
          { path: 'listen/:channel', component: 'app-listener' }
        ],
      } as any,
    ]);
  }

  render() {
    return html`
    <trono-ripple-bg></trono-ripple-bg>
    <app-header></app-header>
      <div id="main">
        <main>
          <div id="routerOutlet"></div>
        </main>
      </div>
      <trono-footer></trono-footer>
    `;
  }
}
