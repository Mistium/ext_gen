/**
 * Code formatter for the Scratch3 Extension Generator
 * Uses Prettier to format generated JavaScript code
 */

const prettier = require('prettier');

/**
 * Format JavaScript code using Prettier
 * @param {string} code - The code to format
 * @returns {string} - Formatted code
 */
function formatCode(code) {
  try {
    return prettier.format(code, {
      parser: 'babel',
      printWidth: 100,
      tabWidth: 2,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      bracketSpacing: true,
      arrowParens: 'avoid',
      endOfLine: 'lf'
    });
  } catch (error) {
    console.warn('Warning: Code formatting failed, returning unformatted code', error.message);
    return code;
  }
}

module.exports = {
  formatCode
};