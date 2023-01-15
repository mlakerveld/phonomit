import { Handler } from '@netlify/functions'
import faunadb from 'faunadb'

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNA_KEY || "ERROR"
})

export const handler: Handler = async (event) => {
    const data = JSON.parse(event.body ?? "{}")

    let uuid = crypto.randomUUID();
    let socketConn = crypto.randomUUID() + crypto.randomUUID();
    await client.query(
        q.Create('rooms', { data: { uuid: uuid, key: data.key, broadcastSock: socketConn } })
      )
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: uuid,
        socket: socketConn
      }),
    }
}
