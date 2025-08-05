import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || 'postgresql://dev_user:dev_password@localhost:5432/backend_dev'

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10
})

export const db = drizzle(client, { schema })

export { client }