import type { Mongoose } from "mongoose"

declare global {
  var myMongoose:
    | {
        conn: typeof Mongoose | null
        promise: Promise<typeof Mongoose> | null
      }
    | undefined
}
