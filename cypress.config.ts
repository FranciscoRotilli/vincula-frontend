import { defineConfig } from 'cypress'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      USERNAME: process.env.CYPRESS_USERNAME,
      PASSWORD: process.env.CYPRESS_PASSWORD,
      API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
  },
})