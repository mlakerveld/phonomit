import { LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { styles as sharedStyles } from '../../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';
import { template } from './broadcaster.template';
import { RouterLocation } from '@vaadin/router';

@customElement('app-broadcaster')
export class AppBroadcaster extends LitElement {
  @state() keys: {sk?: CryptoKey, pk?: CryptoKey} = {};
  @state() channel: string = "";
  @state() chanuuid: string = "";
  @state() socket: string = "";

  static styles = [
    sharedStyles
  ]

  onBeforeEnter(location: RouterLocation) {
    this.channel = location.params.channel as string
    this.startBroadcast(this.channel)
  }

  constructor() {
    super();

    let pk = localStorage.getItem("pk");
    let sk = localStorage.getItem("sk");
    if(pk && sk) {
      this.keys.pk = JSON.parse(pk);
      this.keys.sk = JSON.parse(sk);
    } else {
      this.createKeys()
    }
  }

  async createKeys() {
    let keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true,
      ["encrypt", "decrypt"]
    )
    this.keys.pk = keyPair.publicKey;
    this.keys.sk = keyPair.privateKey;
    window.crypto.subtle.exportKey('jwk',keyPair.privateKey).then((rKey) => {
      localStorage.setItem("sk", JSON.stringify(rKey))
    })
    window.crypto.subtle.exportKey('jwk',keyPair.publicKey).then((rKey) => {
      localStorage.setItem("pk", JSON.stringify(rKey))
    })
  }

  startBroadcast(channel: string): Promise<void> {
    return fetch('/.netlify/functions/start-broadcast', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({key: this.keys.pk})
    }).then((response) => response.json()).then((data: any) => {
      this.chanuuid = data.id
      history.replaceState({}, '', 'broadcaster/' + this.chanuuid)
      this.socket = data.socketConn
      this.listenSocket(this.socket);
      return;
    });
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
    return template;
  }
}
