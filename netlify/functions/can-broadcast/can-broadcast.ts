import { Handler } from '@netlify/functions'
import faunadb from 'faunadb'

interface ReturnInterface {
  ref?: string,
  error?: string
}

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNA_KEY || "ERROR"
})

export const handler: Handler = async (event, context) => {
  let returnData : ReturnInterface = {};
  const { name = null } = event.queryStringParameters

  if(name) {
    var items = await client.query(
      q.Paginate(q.Match(q.Index('Names'), name))
    )
    if(items.length === 0) {
      var createP = await client.query(
        q.Create('rooms', { data: { name: name } })
      )
      returnData.ref = createP.ref
    } else {
      returnData.error = "Already exists"
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      returnData
    }),
  }

}
