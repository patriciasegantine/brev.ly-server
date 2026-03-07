import {env} from '@/env'
import type {Config} from 'drizzle-kit'

export default {
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: 'postgresql',
  schema: 'src/db/schemas/*',
  out: 'src/db/migrations',
} satisfies Config
