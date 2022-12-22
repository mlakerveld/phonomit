import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles } from '../../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';
  @state() channel: string = "";

  static get styles() {
    return [
      styles,
      css`
      #welcomeBar {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      #welcomeCard,
      #infoCard {
        padding: 18px;
        padding-top: 0px;
      }

      pwa-install {
        position: absolute;
        bottom: 16px;
        right: 16px;
      }

      sl-card::part(footer) {
        display: flex;
        justify-content: flex-end;
      }

      @media(min-width: 750px) {
        sl-card {
          width: 70vw;
        }
      }


      @media (horizontal-viewport-segments: 2) {
        #welcomeBar {
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
        }

        #welcomeCard {
          margin-right: 64px;
        }
      }
    `];
  }

  constructor() {
    super();
  }

  canBroadcast(channel: string): Promise<boolean> {
    return fetch('/.netlify/functions/can-broadcast?name=' + channel).then((response) => response.json()).then((data: any) => {
      if(data.error) {
        return false;
      } else {
        return true;
      }
    });
  }

  claimBroadcast(): void {
      window.location.href = (import.meta as any).env.BASE_URL + 'broadcast/' + this.channel
  }

  channelIHandler(e: any) {
    this.channel = e.target.value;
  }

  render() {
    return html`
    <app-header></app-header>

    <main>
      <div id="welcomeBar">
        <sl-card id="welcomeCard">
        <sl-button size="large" href="${(import.meta as any).env.BASE_URL}broadcaster">Broadcast Now!</sl-button>
          <sl-button-group label="Channel">
          <sl-input placeholder="" size="large" .value=${this.channel} @input="${this.channelIHandler}">
          <sl-icon name="at" slot="prefix"></sl-icon>
          </sl-input>
          <sl-button size="large" href="${(import.meta as any).env.BASE_URL}listen/${this.channel}">Listen</sl-button>
        </sl-button-group>


          <p>
            Start broadcasting your audio to people now!
          </p>

        </sl-card>
      </div>

      <pwa-install>Install PWA Starter</pwa-install>
    </main>
    `;
  }
}
