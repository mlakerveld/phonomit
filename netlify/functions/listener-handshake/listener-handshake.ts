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

    let handshakeId = 'h' + self.crypto.randomUUID();
    let message = {channel: handshakeId, sdp: data.sdp};

    let room: any = await client.query(
      q.Get(q.Ref(q.Collection('rooms'), data.id))
    )


    var rest = new Ably.Rest(ablyKey);
    var channel = rest.channels.get(room.data.broadcastSock);
    channel.publish("handshake", message);


    let socketConn = self.crypto.randomUUID() + self.crypto.randomUUID();
    await client.query(
        q.Create('handshakes', { data: { id: handshakeId, key: data.key, broadcastSock: socketConn } })
      )
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: uuid,
        socket: socketConn
      }),
    }
}
