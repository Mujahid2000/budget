// Global type definitions for the application

import type mongoose from "mongoose"

// MongoDB global cache interface
interface GlobalMongoose {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend global namespace
declare global {
  var myMongoose: GlobalMongoose | undefined
}
