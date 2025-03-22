#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { generateExtensionFile } = require('./generator');

function showHelp() {
  console.log('Scratch3 Extension Generator');
  console.log('----------------------------');
  console.log('Usage: node index.js <config-file> [output-file]');
  console.log('');
  console.log('Arguments:');
  console.log('  config-file  Path to JSON configuration file');
  console.log('  output-file  (Optional) Path to output file. If not provided, uses extension ID');
  console.log('');
  console.log('Example:');
  console.log('  node index.js myExtension.json');
  console.log('  node index.js myExtension.json ./output/myExtension.js');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }
  
  const configFile = args[0];
  
  try {
    const configData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    
    if (!configData.extension || !configData.blocks) {
      console.error('Error: Configuration must include "extension" and "blocks" properties');
      return;
    }
    
    const extension = configData.extension;
    const blocks = configData.blocks;
    
    // Generate the extension file
    const outputContent = generateExtensionFile(extension, blocks);
    
    // Determine output file path
    let outputPath = args[1];
    if (!outputPath) {
      outputPath = `${extension.id}.js`;
    }
    
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    if (outputDir && outputDir !== '.' && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the output file
    fs.writeFileSync(outputPath, outputContent, 'utf8');
    
    console.log(`Extension generated successfully: ${outputPath}`);
  } catch (error) {
    console.error('Error processing configuration file:', error.message);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
