import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:8080",
    channel: process.env.CI ? undefined : "msedge",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
