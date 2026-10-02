import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./browser-tests",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:4182",
    browserName: "chromium",
    launchOptions: { executablePath: process.env.PORTER_CHROMIUM || undefined },
  },
  webServer: {
    command: "npm run preview",
    url: "http://127.0.0.1:4182",
    reuseExistingServer: true,
  },
});
