import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { styles as sharedStyles } from '../../styles/shared-styles'
import '../../components/trono-loader';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import { RouterLocation } from '@vaadin/router';
import SimplePeer, { Instance } from 'simple-peer';
import { guard } from "lit-html/directives/guard.js";

@customElement('app-listener')
export class AppListener extends LitElement {
  @state() chanuuid: string = "";
  @state() peer: Instance | null = null;
  @state() key: CryptoKey | null = null;
  @state() encKey: number[] | null = null;
  @state() stream: MediaStream | null = null;
  hsId: string = "";
  status: boolean = false;
  @state() muted: boolean = false;

  static styles = [
    sharedStyles
  ]

  async onBeforeEnter(location: RouterLocation) {
    this.chanuuid = location.params.channel as string;

    await this.generateKeys();

    this.startWebRTC();
  }

  constructor() {
    super();
  }

  async generateKeys() {
    this.key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );

    let pbKey: JsonWebKey = await this.getStreamKey() as JsonWebKey;

    let bKey = await window.crypto.subtle.importKey(
      "jwk",
      pbKey,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );

    await window.crypto.subtle.exportKey('jwk',this.key).then(async (rKey) => {
      this.encKey = await Array.from(new Uint8Array(await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP"
        },
        bKey,
        new TextEncoder().encode(JSON.stringify(rKey))
      )));
    })


  }

  startWebRTC(): void {
    this.peer = new SimplePeer({
      trickle: false,
      initiator: true
    });
    this.peer.addTransceiver("audio", {direction: "recvonly"})

    this.peer.on('signal', async (data: SimplePeer.SignalData) => {
      console.log("MUST SIGNAL");
      console.log(data);
      fetch('/.netlify/functions/listener-handshake', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: this.encKey,
          id: this.chanuuid,
          sdp: await this.encryptData(JSON.stringify(data)),
          hsId: this.hsId ? this.hsId : undefined
        })
      }).then((response) => response.json()).then((data: any) => {
        if(!this.hsId) {
          this.hsId = data.id;
          this.listenSocket(data.socket);
        }
        return;
      });
    });

    this.peer.on('data', (data: SimplePeer.SimplePeerData) => {
      let jData = JSON.parse(data as string);
      if(jData.type === "mute") {
        this.muted = jData.value;
      }
      this.requestUpdate();
    });

    this.peer.on('stream', (data: MediaStream) => {
      this.stream = data;
      console.log("STREAM: " + data)
    });

    this.peer.on('connect', () => {
      console.log('connected to peer')
      this.peer?.send("hi");
    });
  }

  async encryptData(data: string) : Promise<{iv: number[], data: number[]}> {
    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    let eData = new TextEncoder().encode(data);
    let buffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      this.key!,
      eData
    );
    return Promise.resolve({iv: Array.from(iv), data: Array.from(new Uint8Array(buffer))});
  }

  getStreamKey(): Promise<string> {
    return fetch('/.netlify/functions/get-key', {method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: this.chanuuid,
    })}).then(resp => resp.json())
  }

  listenSocket(socket: string): void {
    var key = 'fySCMw.J8cX4Q:961UZSb7JKCNqJHa0Gi3S2VHe2JOWXVLJ0BGYhFJgog';
    var url = 'https://realtime.ably.io/event-stream?channels=' + socket + '&v=1.1&key=' + key;
    var eventSource = new EventSource(url);

    eventSource.onmessage = async (event) => {
      var message = JSON.parse(JSON.parse(event.data).data);
      let sdp = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(message.iv)
        },
        this.key!,
        new Uint8Array(message.data).buffer
      );
      let sdpMessage = JSON.parse(new TextDecoder().decode(sdp));
      console.log(sdpMessage);
      this.peer!.signal(sdpMessage);
    };
  }

  getAudioPlayer() {
    if(this.stream) {
      return html`
        ${this.muted ? html`<b>Host has muted their mic</b>` : html``}
        <audio style="display: none" id="player" controls .srcObject=${guard(this.stream, () => this.stream)}></audio>

        <sl-icon id='audio-icon' @click="${this.play}" style="font-size: 20rem;" name="play-circle-fill"></sl-icon>
      `
    } else {
      return html`<trono-loader></trono-loader>`;
    }
  }

  play() {
    let aplayer: HTMLAudioElement = this.shadowRoot?.getElementById("player") as HTMLAudioElement;
    let aicon = this.shadowRoot!.getElementById("audio-icon");
    if(this.status) {
      aplayer!.pause();
      aicon!.setAttribute("name", "play-circle-fill");
    } else {
      aplayer!.play();
      aicon!.setAttribute("name", "stop-circle-fill");
    }
    this.status = !this.status;
  }

  render() {
    return html`
    <main>
      <sl-card class="listen-card">
        Listening to ${this.chanuuid}
        <br/>
        <br/>
        ${this.getAudioPlayer()}
      </sl-card>
    </main>
    `;
  }
}
