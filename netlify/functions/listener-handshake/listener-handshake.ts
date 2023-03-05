import { Handler } from '@netlify/functions'
import faunadb from 'faunadb'
import Ably from 'ably'
import crypto from 'node:crypto'

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNA_KEY || "ERROR"
})

const ablyKey = process.env.ABLY_KEY || "ERROR"

export const handler: Handler = async (event) => {
    const data = JSON.parse(event.body ?? "{}")

    let room: any = await client.query(
      q.Get(q.Match(q.Index('UUID'), data.id))
    )

    let handshakeId = data.hsId ?? 'h' + crypto.randomUUID() + '-' + crypto.randomUUID();

    let listeningSock = data.hsId ? null : 'h' + crypto.randomUUID() + '-' + crypto.randomUUID();
    if(!data.hsId) {
      await client.query(
        q.Create('handshakes', { data: { uuid: handshakeId, broadcastSock: listeningSock } })
      )
    }

    let key = await crypto.webcrypto.subtle.importKey(
      "jwk",
      room.data.key,
      {
        name: "RSA-OAEP",
        hash: "SHA-256"
      },
      true,
      ["encrypt"]
    );

    let enc = new TextEncoder();
    let rChannel = await crypto.webcrypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      key,
      enc.encode(handshakeId)
    );

    let rChannelStr = Array.from(new Uint8Array(rChannel));

    let message = {channel: rChannelStr, sdp: data.sdp, key: data.key};

    let rest = new Ably.Rest(ablyKey);
    let channel = rest.channels.get(room.data.broadcastSock);
    channel.publish("handshake", message);

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: handshakeId,
        socket: listeningSock
      }),
    }
}
