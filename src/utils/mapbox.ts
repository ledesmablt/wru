import { z } from 'zod'
import { env } from '../env/server.mjs'

const baseUrl = 'https://api.mapbox.com'

const { MAPBOX_API_TOKEN } = env

const searchResponseFeatureSchema = z.object({
  id: z.string(),
  text: z.string(),
  place_name: z.string(),
  center: z.array(z.number()),
  relevance: z.number()
})
const searchResponseSchema = z.object({
  type: z.string(),
  query: z.array(z.string()),
  features: z.array(searchResponseFeatureSchema),
  attribution: z.string()
})

export const mapbox = {
  async search(query: string) {
    // NOTE: mapbox is not getting the right results. do we switch to another location search thing? google?
    const urlEncodedQuery = encodeURIComponent(query)
    const res = await fetch(
      `${baseUrl}/geocoding/v5/mapbox.places/${urlEncodedQuery}.json?access_token=${MAPBOX_API_TOKEN}`
    )
    if (res.status !== 200) {
      throw new Error(await res.text())
    }
    const searchRes = searchResponseSchema.parse(await res.json())
    // put trust in GCal location strings
    const topResult = searchRes.features[0]
    if (topResult?.relevance > 0.6) {
      return topResult
    }
  }
}
