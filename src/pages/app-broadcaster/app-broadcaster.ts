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

  static styles = [
    sharedStyles
  ]

  onBeforeEnter(location: RouterLocation) {
    this.channel = location.params.channel as string
    console.log(this.channel);
    this.claimBroadcast(this.channel)
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

  claimBroadcast(channel: string): Promise<void> {
    return fetch('/.netlify/functions/claim-channel', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({channel: channel, key: this.keys.pk})
    }).then((response) => response.json()).then((data: any) => {
      this.chanuuid = data.ref
      return;
    });
  }

  render() {
    return template;
  }
}
