import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import { styles as sharedStyles } from '../../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/avatar/avatar.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';
import '../../components/select-device';
import { RouterLocation } from '@vaadin/router';
import SimplePeer, { Instance } from 'simple-peer';

interface Peer {
  id: string,
  connecting: boolean,
  connect?: Date,
  disconnect?: Date,
  name: string,
  instance: Instance
}


@customElement('app-broadcaster')
export class AppBroadcaster extends LitElement {
  @state() keys: {sk?: CryptoKey, pk?: CryptoKey, pkJWK?: JsonWebKey} = {};
  @state() peer: Instance | null = null;
  @state() channel: string = "";
  @state() chanuuid: string = "";
  @state() socket: string = "";
  @state() peers: Peer[] = [];
  @state() micMuted: boolean = true;
  stream: MediaStream | null = null;

  static styles = [
    sharedStyles
  ]

  async onBeforeEnter(location: RouterLocation) {
    let pk = localStorage.getItem("pk");
    let sk = localStorage.getItem("sk");
    if(pk && sk) {
      await this.importKeys(JSON.parse(pk), JSON.parse(sk));
    } else {
      await this.createKeys()
    }
    this.channel = location.params.channel as string;
    this.startBroadcast(this.channel);
  }

  addMedia(stream: MediaStream) {
    this.stream = stream;
    for(let peer of this.peers) {
      peer.instance.addStream(stream);
    }
  }

  constructor() {
    super();
  }

  async importKeys(pk: JsonWebKey, sk: JsonWebKey) {
    let pkck = await crypto.subtle.importKey(
      "jwk",
      pk,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );
    let skck = await crypto.subtle.importKey(
      "jwk",
      sk,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["decrypt"]
    );
    this.keys.pkJWK = pk;
    this.keys.sk = skck;
    this.keys.pk = pkck;
  }

  async createKeys() {
    let keypair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true,
      ["encrypt", "decrypt"]
    );
    this.keys.sk = keypair.privateKey;
    this.keys.pk = keypair.publicKey;
    window.crypto.subtle.exportKey('jwk',keypair.privateKey).then((rKey) => {
      localStorage.setItem("sk", JSON.stringify(rKey))
    })
    window.crypto.subtle.exportKey('jwk',keypair.publicKey).then((rKey) => {
      localStorage.setItem("pk", JSON.stringify(rKey))
      this.keys.pkJWK = rKey;
    })
  }

  startBroadcast(channel: string): Promise<void> {
    return fetch('http://localhost:8888/.netlify/functions/start-broadcast', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({key: this.keys.pkJWK, id: channel})
    }).then((response) => response.json()).then((data: any) => {
      this.chanuuid = data.id
      history.replaceState({}, '', 'broadcaster/' + this.chanuuid)
      this.listenSocket(data.socket);
      return;
    });
  }

  listenSocket(socket: string): void {
    var key = 'fySCMw.J8cX4Q:961UZSb7JKCNqJHa0Gi3S2VHe2JOWXVLJ0BGYhFJgog';
    var url = 'https://realtime.ably.io/event-stream?channels=' + socket + '&v=1.1&key=' + key;
    var eventSource = new EventSource(url);

    eventSource.onmessage = (event: any) => {
      console.log('received ably message')
      var message = JSON.parse(event.data);
      if(message.name === "handshake") {
        this.parseHandshake(JSON.parse(message.data));
      }
    };
  }

  async parseHandshake(message: any) {
    let decoder = new TextDecoder();
    let hsId = message.channel;
    hsId = new Uint8Array(hsId).buffer;
    hsId = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      this.keys.sk!,
      hsId
    );
    hsId = decoder.decode(hsId);
    let key = message.key;
    key = new Uint8Array(key).buffer;
    key = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      this.keys.sk!,
      key
    );
    key = decoder.decode(key);
    let cKey = await window.crypto.subtle.importKey(
      "jwk",
      JSON.parse(key),
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
    let sdp = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(message.sdp.iv)
      },
      cKey,
      new Uint8Array(message.sdp.data).buffer
    );
    let sdpStr = decoder.decode(sdp);

    let existingPeer = this.peers.find(peer => peer.id === hsId);
    if(existingPeer) {
      console.log("existing peer");
      existingPeer.instance.signal(sdpStr);
    } else {
      this.startPeering(cKey, hsId, sdpStr);
    }
  }

  async startPeering(key: CryptoKey, hsId: string, sdp: string) {
    let peer: Peer = {
      id: hsId,
      connecting: true,
      name: "Anonymous " + this.peers.length,
      instance: new SimplePeer({
      trickle: false,
      stream: this.stream ?? undefined
    })};

    this.peers.push(peer);
    this.requestUpdate();

    peer.instance.on('signal', async (data: SimplePeer.SignalData) => {

      let iv = window.crypto.getRandomValues(new Uint8Array(12));
      let eData = new TextEncoder().encode(JSON.stringify(data));

      let buffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        eData
      );
      fetch('http://localhost:8888/.netlify/functions/broadcast-handshake', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id: hsId,iv: Array.from(iv), data: Array.from(new Uint8Array(buffer))})
    })
    });

    peer.instance.on('data', (data: SimplePeer.SimplePeerData) => {
      console.log(peer.name + " DATA: " + data)
    });

    peer.instance.on('connect', () => {
      peer.connecting = false;
      peer.connect = new Date();
      console.log(peer.name + ' connected to peer')
    });

    peer.instance.on('close', () => {
      console.log('dis');
      peer.disconnect = new Date();
      this.requestUpdate();
    });

    peer.instance.on('error', (e) => {
      console.log(e.message);
    });

    peer.instance.signal(sdp);
  }

  broadcast(message: string) {
    this.peers.forEach((peer) => {
      peer.instance.send(message);
    })
  }

  muteToggle() {
    this.micMuted = !this.micMuted;
    if(!this.micMuted) {
      if(!this.stream) {
        navigator.mediaDevices.getUserMedia({
          audio: true
        }).then((stream) => this.addMedia(stream)).catch((e) => {console.log(e.message);})
        return;
      }
    }
    this.stream!.getAudioTracks()[0].enabled = !this.micMuted;
    this.broadcast(JSON.stringify({type: "mute", value: this.micMuted}));
  }

  render() {
    let micIcon = this.micMuted ? "mic-mute-fill" : "mic-fill";
    return html`
    <main>
      <h2>Broadcast</h2>

      <sl-card>
        <trono-select-device></trono-select-device>
        <sl-icon @click=${this.muteToggle} name="${micIcon}" style="font-size:15rem"></sl-icon>
      </sl-card>
      <br/>

      <sl-card>
        <sl-badge style="font-size: 1.5rem;" variant="danger" pill pulse>Listeners: ${this.peers.filter(peer => !peer.disconnect).length}</sl-badge>
      </sl-card>

      <sl-card>
        ${this.peers.map((peer) =>
          html`<sl-avatar label="${peer.name}"></sl-avatar> ${peer.name} - <sl-relative-time date="${ifDefined(peer.connect)}" format="narrow" sync></sl-relative-time><br/>`
          )}
      </sl-card>
    </main>
    `;
  }
}
