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

    let listenerHandshake: any = await client.query(
      q.Get(q.Match(q.Index('handshake-uuid'), data.id))
    )

    let message = {data: data.data, iv: data.iv};

    let rest = new Ably.Rest(ablyKey);
    let channel = rest.channels.get(listenerHandshake.data.broadcastSock);
    channel.publish("handshake", message);

    return {
      statusCode: 200
    }
}
