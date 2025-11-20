import { defineConfig } from 'cypress'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      USER_USERNAME: process.env.CYPRESS_USERNAME_USER,
      USER_PASSWORD: process.env.CYPRESS_PASSWORD_USER,
      ADMIN_USERNAME: process.env.CYPRESS_USERNAME_ADMIN,
      ADMIN_PASSWORD: process.env.CYPRESS_PASSWORD_ADMIN,
      API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
  },
})