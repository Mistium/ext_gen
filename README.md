# Scratch3 Extension Generator

A utility to generate Scratch3 extensions based on a configuration file.

## Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/Mistium/ext_gen.git
cd ext_gen
npm install
```

## Usage

Create a JSON configuration file for your extension, then run:

```bash
node index.js your-config.json [output-file.js]
```

If you don't specify an output file, it will use the extension ID from your config.

## Configuration Format

Your configuration file should have this structure:

```json
{
  "extension": {
    "name": "Extension Name",
    "id": "extensionId",
    "color1": "#HexColor"
  },
  "blocks": [
    "Label Text", // Creates a label block
    "---", // Creates a separator
    {
      "opcode": "myBlockOpcode",
      "blockType": "COMMAND", // COMMAND, REPORTER, BOOLEAN, or CONDITIONAL
      "text": "my block [argument]", // Block text with [argument] placeholders
      "code": "myCodeTemplate([argument])", // Code template with [argument] placeholders
      "returns": "STRING", // For REPORTER and BOOLEAN blocks (STRING, BOOLEAN, etc.)
      "allowDropAnywhere": true, // Optional, for reporter blocks
      "arguments": {
        "argument": { // Must match placeholder names in text and code
          "type": "STRING", // STRING, BOOLEAN, NUMBER, COLOR, ANGLE
          "val": "default value" // Optional default value
        }
      }
    }
  ]
}
```

## Example

Check the included `example-config.json` for a complete example.

## Output Format

The generator produces a JavaScript file that can be used as a Scratch3 extension.
The output follows the structure required by the Scratch3 extension system, including
all necessary patches to make the extension work properly.

## License

MPL-2.0
