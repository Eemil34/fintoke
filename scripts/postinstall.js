#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

if (
  process.env.CI ||
  process.env.VERCEL ||
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_ID ||
  process.env.RAILPACK ||
  process.env.SKIP_ENV_SETUP === '1'
) {
  process.exit(0);
}

const setup = path.join(__dirname, 'setup-env.js');
if (!fs.existsSync(setup)) {
  process.exit(0);
}

require(setup);
