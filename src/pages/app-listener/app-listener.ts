import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { styles as sharedStyles } from '../../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';
import { RouterLocation } from '@vaadin/router';

import SimplePeer from 'simple-peer';

@customElement('app-listener')
export class AppListener extends LitElement {
  @state() chanuuid: string = "";
  @state() peer: SimplePeer | null = null;

  static styles = [
    sharedStyles
  ]

  onBeforeEnter(location: RouterLocation) {
    this.chanuuid = location.params.channel as string

    this.startWebRTC();
  }

  constructor() {
    super();
  }

  startWebRTC(): void {
    this.peer = new SimplePeer({
      initiator: true,
      trickle: false
    })
  }

  listenSocket(socket: string): void {
    var key = 'fySCMw.J8cX4Q:961UZSb7JKCNqJHa0Gi3S2VHe2JOWXVLJ0BGYhFJgog';
    var url = 'https://realtime.ably.io/event-stream?channels=' + socket + '&v=1.1&key' + key;
    var eventSource = new EventSource(url);

    eventSource.onmessage = function(event) {
      var message = JSON.parse(event.data);
      console.log('Message: ' + message.name + ' - ' + message.data);
    };
  }

  render() {
    return html`Listening to ${this.chanuuid}`;
  }
}
