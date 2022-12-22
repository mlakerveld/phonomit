import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

import './pages/app-home/app-home';
import './components/header';
import './styles/global.css';
import { setBasePath } from '@shoelace-style/shoelace';

@customElement('app-index')
export class AppIndex extends LitElement {
  static get styles() {
    return css`
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
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/

    setBasePath("/assets/shoelace")

    // For more info on using the @vaadin/router check here https://vaadin.com/router
    const router = new Router(this.shadowRoot?.querySelector('#routerOutlet'));
    router.setRoutes([
      // temporarily cast to any because of a Type bug with the router
      {
        path: (import.meta as any).env.BASE_URL,
        animate: true,
        children: [
          { path: '', component: 'app-home' },
          { path: 'broadcaster/:channel', component: 'app-broadcaster',
          action: async () => {
            await import('./pages/app-broadcaster/app-broadcaster.js');
          },},
          { path: 'listener/:channel', component: 'app-listener' },
          {
            path: 'about',
            component: 'app-about',
            action: async () => {
              await import('./pages/app-about/app-about.js');
            },
          }
        ],
      } as any,
    ]);
  }

  render() {
    return html`
      <div>
        <main>
          <div id="routerOutlet"></div>
        </main>
      </div>
    `;
  }
}