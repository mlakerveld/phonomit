import { Handler } from '@netlify/functions'
import faunadb from 'faunadb'
import Ably from 'ably'

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNA_KEY || "ERROR"
})

const ablyKey = process.env.ABLY_KEY || "ERROR"

export const handler: Handler = async (event) => {
    const data = JSON.parse(event.body ?? "{}")

    let room: any = await client.query(
      q.Get(q.Ref(q.Collection('rooms'), data.id))
    )

    let handshakeId = 'h' + crypto.randomUUID() + crypto.randomUUID();

    let key = await window.crypto.subtle.importKey(
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
    let rChannel = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      key,
      enc.encode(handshakeId)
    );

    let rChannelStr = new Uint8Array(rChannel).join(",");

    let message = {channel: rChannelStr, sdp: data.sdp};

    let rest = new Ably.Rest(ablyKey);
    let channel = rest.channels.get(room.data.broadcastSock);
    channel.publish("handshake", message);

    return {
      statusCode: 200,
      body: JSON.stringify({
        socket: handshakeId
      }),
    }
}
