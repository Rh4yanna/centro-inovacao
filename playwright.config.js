import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://localhost:5173', channel: 'chrome', screenshot: 'only-on-failure' },
  webServer: { command: 'node node_modules/vite/bin/vite.js --host localhost', url: 'http://localhost:5173', reuseExistingServer: false },
  projects: [ {name:'desktop',use:{viewport:{width:1440,height:900}}}, {name:'mobile',use:{viewport:{width:390,height:844}}} ],
});
