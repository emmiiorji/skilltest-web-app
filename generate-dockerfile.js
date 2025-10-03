#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read captain-definition
const captainDef = JSON.parse(fs.readFileSync('captain-definition', 'utf8'));

// Extract dockerfile lines
const dockerfileLines = captainDef.dockerfileLines;

// Create Dockerfile content
const dockerfileContent = [
  '# Auto-generated from captain-definition - DO NOT EDIT DIRECTLY',
  '# Edit captain-definition instead and run: node generate-dockerfile.js',
  '',
  ...dockerfileLines
].join('\n');

// Write Dockerfile
fs.writeFileSync('Dockerfile', dockerfileContent);

console.log('✅ Dockerfile generated from captain-definition');