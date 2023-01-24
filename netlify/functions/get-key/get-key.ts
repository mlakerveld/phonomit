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

    return {
      statusCode: 200,
      body: JSON.stringify(room.data.key)
    }
}
