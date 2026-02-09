#!/usr/bin/env node

/**
 * Deployment Verification Script
 *
 * Run this script to verify your Marginalia deployment is ready:
 * node verify-deployment.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Marginalia Deployment Verification\n');

let hasErrors = false;

// Check Node.js version
console.log('1. Checking Node.js version...');
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0], 10);
if (majorVersion >= 18) {
  console.log(`   ✓ Node.js ${nodeVersion} (>= 18.0.0 required)`);
} else {
  console.log(`   ✗ Node.js ${nodeVersion} is too old (>= 18.0.0 required)`);
  hasErrors = true;
}

// Check npm version (if available)
console.log('\n2. Checking npm version...');
try {
  const { execSync } = await import('child_process');
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  const npmMajor = parseInt(npmVersion.split('.')[0], 10);
  if (npmMajor >= 9) {
    console.log(`   ✓ npm ${npmVersion} (>= 9.0.0 required)`);
  } else {
    console.log(`   ✗ npm ${npmVersion} is too old (>= 9.0.0 required)`);
    hasErrors = true;
  }
} catch (error) {
  console.log('   ⚠ Could not check npm version');
}

// Check environment variables
console.log('\n3. Checking environment variables...');
const requiredVars = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];

// Try to load .env file
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    });
  }
} catch (error) {
  // Ignore, environment variables might be set by platform
}

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your_api_key_here' && value !== 'your_key_here') {
    console.log(`   ✓ ${varName} is set`);
  } else {
    console.log(`   ✗ ${varName} is missing or invalid`);
    hasErrors = true;
  }
});

// Check build artifacts
console.log('\n4. Checking build artifacts...');

const clientDistPath = path.join(__dirname, 'client/dist');
const serverDistPath = path.join(__dirname, 'server/dist');

if (fs.existsSync(clientDistPath)) {
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    console.log('   ✓ Client build exists (client/dist/index.html)');
  } else {
    console.log('   ✗ Client build incomplete (missing index.html)');
    hasErrors = true;
  }
} else {
  console.log('   ✗ Client not built (run: npm run build)');
  hasErrors = true;
}

if (fs.existsSync(serverDistPath)) {
  const indexJs = path.join(serverDistPath, 'index.js');
  if (fs.existsSync(indexJs)) {
    console.log('   ✓ Server build exists (server/dist/index.js)');
  } else {
    console.log('   ✗ Server build incomplete (missing index.js)');
    hasErrors = true;
  }
} else {
  console.log('   ✗ Server not built (run: npm run build)');
  hasErrors = true;
}

// Check package.json scripts
console.log('\n5. Checking package.json scripts...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const requiredScripts = ['postinstall', 'build', 'start'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`   ✓ Script "${script}" exists`);
    } else {
      console.log(`   ✗ Script "${script}" missing`);
      hasErrors = true;
    }
  });
} else {
  console.log('   ✗ package.json not found');
  hasErrors = true;
}

// Check configuration files
console.log('\n6. Checking configuration files...');
const configFiles = ['Procfile', 'railway.toml', 'render.yaml'];
configFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✓ ${file} exists`);
  } else {
    console.log(`   ⚠ ${file} missing (optional but helpful for deployment)`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ DEPLOYMENT NOT READY');
  console.log('\nPlease fix the errors above before deploying.');
  console.log('\nCommon fixes:');
  console.log('  - Run: npm install');
  console.log('  - Run: npm run build');
  console.log('  - Set environment variables in .env or platform dashboard');
  process.exit(1);
} else {
  console.log('✅ DEPLOYMENT READY');
  console.log('\nYour Marginalia app is ready to deploy!');
  console.log('\nNext steps:');
  console.log('  1. Push your code to GitHub');
  console.log('  2. Deploy to Railway, Render, Heroku, or fly.io');
  console.log('  3. Set environment variables in platform dashboard');
  console.log('  4. Watch the build logs for any issues');
  console.log('\nSee DEPLOYMENT.md for platform-specific instructions.');
  process.exit(0);
}
