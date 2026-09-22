const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:8081',
  },
  webServer: [
    {
      command: 'node api/server.js',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 10000,
    },
    {
      command: 'node ui/server.js',
      port: 8081,
      reuseExistingServer: !process.env.CI,
      timeout: 10000,
    },
  ],
});
