/**
 * Scratch 3 Extension Generator
 * Creates formatted extension files based on JSON configuration
 */

const { formatCode } = require('./formatter');

class ExtensionGenerator {
  constructor() {
    this.blockTypeMap = {
      'COMMAND': 'Scratch.BlockType.COMMAND',
      'REPORTER': 'Scratch.BlockType.REPORTER',
      'BOOLEAN': 'Scratch.BlockType.BOOLEAN',
      'CONDITIONAL': 'Scratch.BlockType.CONDITIONAL',
      'LABEL': 'Scratch.BlockType.LABEL'
    };
    
    this.argTypeMap = {
      'STRING': 'Scratch.ArgumentType.STRING',
      'BOOLEAN': 'Scratch.ArgumentType.BOOLEAN',
      'NUMBER': 'Scratch.ArgumentType.NUMBER',
      'COLOR': 'Scratch.ArgumentType.COLOR',
      'ANGLE': 'Scratch.ArgumentType.ANGLE'
    };
  }
  
  /**
   * Generates a random ID for arguments
   * @returns {string} A random ID string
   */
  generateRandomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 11; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * Processes a block definition to add necessary properties
   * @param {Object} block - Block definition object
   * @returns {Object} - Processed block definition
   */
  processBlock(block) {
    if (typeof block === 'string') {
      // Handle separator or label
      if (block === '---') {
        return "---";
      } else {
        return {
          "blockType": this.blockTypeMap['LABEL'],
          "text": block
        };
      }
    }
    
    const processedBlock = {
      "opcode": block.opcode,
      "blockType": this.blockTypeMap[block.blockType],
      "text": block.text,
      "code": block.code || "",
      "func": "err"
    };
    
    // Add returns property if specified
    if (block.returns) {
      processedBlock.returns = block.returns;
    }
    
    // Add allowDropAnywhere if specified
    if (block.allowDropAnywhere) {
      processedBlock.allowDropAnywhere = block.allowDropAnywhere;
    }
    
    // Process arguments
    if (block.arguments) {
      processedBlock.arguments = {};
      let i = 0;
      for (const argName of Object.keys(block.arguments)) {
        i ++;
        const argConfig = block.arguments[argName];
        const genId = block.opcode + '_arg' + i;
        
        processedBlock.arguments[argName] = {
          "type": this.argTypeMap[argConfig.type],
          "gen_id": genId
        };
        
        // Process code to replace argument placeholder with gen_id reference
        if (processedBlock.code) {
          processedBlock.code = processedBlock.code.replaceAll(`[${argName}]`, `\${${genId}}`);
        }
      }
    }
    
    return processedBlock;
  }
  
  /**
   * Generates JSGP handling code for each block
   * @param {Object} extension - Object of extension details
   * @param {Array} blocks - Array of block definitions
   * @returns {string} - Generated code for JSGP handlers
   */
  generateJSGPCode(extension, blocks) {
    let code = '';
    
    blocks.forEach(block => {
      if (typeof block === 'string') return; // Skip labels and separators
      if (!block.code) return "";

      const opcode = block.opcode;
      let blockCode = `\n        case '${extension.id}.${opcode}':\n`;
      
      // Add code for each argument
      if (block.arguments) {
        for (const argName of Object.keys(block.arguments)) {
          const argInfo = block.arguments[argName];
          const genId = argInfo.gen_id;
          const argType = argInfo.type.split('.').pop().toLowerCase();
          let method = 'asString';
          
          if (argType === 'number') method = 'asNumber';
          else if (argType === 'boolean') method = 'asBoolean';
          
          blockCode += `          const ${genId} = this.descendInput(node?.${argName}).${method}();\n`;
        }
      }
      
      // For COMMAND blocks, add to source
      if (block.blockType.includes('COMMAND')) {
        blockCode += `          this.source += \`\\n${block.code};\\n\`;\n`;
        blockCode += `          return;\n`;
      } 
      // For CONDITIONAL blocks
      else if (block.blockType.includes('CONDITIONAL')) {
        blockCode += `          this.source += \`\\n${block.code};\\n\`;\n`;
        blockCode += `          return;\n`;
      }
      // For BOOLEAN blocks
      else if (block.blockType.includes('BOOLEAN')) {
        const valueArg = Object.keys(block.arguments)[0]; // Typically first arg is the value
        const valueGenId = block.arguments[valueArg].gen_id;
        blockCode += `          this.source += \`\\nvm.runtime.visualReport("\${block.id}", \${${valueGenId}});\\n\`;\n`;
        blockCode += `          return;\n`;
      }
      // For REPORTER blocks
      else if (block.blockType.includes('REPORTER')) {
        const valueArg = Object.keys(block.arguments)[0]; // Typically first arg is the value
        const valueGenId = block.arguments[valueArg].gen_id;
        blockCode += `          this.source += \`\\nvm.runtime.visualReport("\${block.id}", \${${valueGenId}});\\n\`;\n`;
        blockCode += `          return;\n`;
      }
      
      code += blockCode;
    });
    
    return code;
  }
  
  /**
   * Generates input handling code for JSGP
   * @param {Object} extension - Object of extension details
   * @param {Array} blocks - Array of block definitions
   * @returns {string} - Generated code for input handlers
   */
  generateInputHandlerCode(extension, blocks) {
    let code = '';
    
    blocks.forEach(block => {
      if (typeof block === 'string') return; // Skip labels and separators
      if (!block.code) return "";

      const opcode = block.opcode;
      let blockCode = `\n        case '${extension.id}.${opcode}':\n`;
      
      // Add code for each argument
      if (block.arguments) {
        for (const argName of Object.keys(block.arguments)) {
          const argInfo = block.arguments[argName];
          const genId = argInfo.gen_id;
          const argType = argInfo.type.split('.').pop().toLowerCase();
          let method = 'asString';
          
          if (argType === 'number') method = 'asNumber';
          else if (argType === 'boolean') method = 'asBoolean';
          
          blockCode += `          const ${genId} = this.descendInput(node?.${argName}).${method}();\n`;
        }
      }
      
      let returnType = 'TYPE_UNKNOWN';
      if (block.returns === 'STRING') returnType = 'TYPE_STRING';
      else if (block.returns === 'BOOLEAN') returnType = 'TYPE_BOOLEAN';
      else if (block.returns === 'NUMBER') returnType = 'TYPE_NUMBER';
      
      blockCode += `          return new TypedInput(\`${block.code}\`, ${returnType});\n`;
      
      code += blockCode;
    });
    
    return code;
  }
  
  /**
   * Generates STGP handling code for each block
   * @param {Object} extension - Object of extension details
   * @param {Array} blocks - Array of block definitions
   * @returns {string} - Generated code for STGP handlers
   */
  generateSTGPCode(extension, blocks) {
    let code = '';
    
    blocks.forEach(block => {
      if (typeof block === 'string') return; // Skip labels and separators
      if (!block.code) return "";

      const opcode = block.opcode;
      let blockCode = `\n        case '${extension.id}_${opcode}':\n`;
      blockCode += `          return {\n            block, kind: '${extension.id}.${opcode}',\n`;
      
      // Add code for each argument
      if (block.arguments) {
        for (const argName of Object.keys(block.arguments)) {
          blockCode += `              ${argName}: this.descendInputOfBlock(block, '${argName}'),\n`;
        }
      }
      
      blockCode += `          };\n`;
      
      code += blockCode;
    });
    
    return code;
  }
  
  /**
   * Generates input handling code for STGP
   * @param {Object} extension - Object of extension details
   * @param {Array} blocks - Array of block definitions
   * @returns {string} - Generated code for STGP input handlers
   */
  generateSTGPInputHandlerCode(extension, blocks) {
    let code = '';
    
    blocks.forEach(block => {
      if (typeof block === 'string') return; // Skip labels and separators
      if (!block.code) return "";

      const opcode = block.opcode;
      let blockCode = `\n        case '${extension.id}_${opcode}':\n`;
      blockCode += `          return {\n            block,\n            kind: '${extension.id}.${opcode}',\n`;
      
      // Add code for each argument
      if (block.arguments) {
        for (const argName in block.arguments) {
          blockCode += `              ${argName}: this.descendInputOfBlock(block, '${argName}'),\n`;
        }
      }
      
      blockCode += `          };\n`;
      
      code += blockCode;
    });
    
    return code;
  }
  
  /**
   * Generates the getInfo() method content for the extension
   * @param {Object} extension - Extension configuration
   * @param {Array} blocks - Array of block definitions
   * @returns {string} - Generated getInfo method content
   */
  generateGetInfo(extension, blocks) {
    // Format the blocks array
    let blocksString = 'blocks: [';
    
    blocks.forEach((block, index) => {
      if (typeof block === 'string') {
        if (block === '---') blocksString += `\n          "${block}",`;
        else blocksString += `\n          {\n            "blockType": Scratch.BlockType.LABEL,\n            "text": "${block}"\n          },`;
      } else {
        blocksString += '\n          {';
        
        // Add opcode if present
        if (block.opcode) blocksString += `\n            "opcode": "${block.opcode}",`;
        
        // Add blockType
        blocksString += `\n            "blockType": ${block.blockType},`;
        
        // Add text
        blocksString += `\n            "text": "${block.text}",`;
        
        if (block.code) blocksString += `\n            "code": "${block.code}",`;
        if (block.returns) blocksString += `\n            "returns": "${block.returns}",`;
        if (block.allowDropAnywhere) blocksString += `\n            "allowDropAnywhere": ${block.allowDropAnywhere},`;
        
        // Add arguments if present
        if (block.arguments && Object.keys(block.arguments).length > 0) {
          blocksString += `\n            "arguments": {`;
          
          for (const argName in block.arguments) {
            const arg = block.arguments[argName];
            blocksString += `\n              "${argName}": {`;
            blocksString += `\n                "type": ${arg.type},`;
            blocksString += `\n                "gen_id": "${arg.gen_id}"`;
            blocksString += '\n              },';
          }
          
          blocksString = blocksString.slice(0, -1); // Remove trailing comma
          blocksString += '\n            },';
        }
        
        // Add func
        blocksString += `\n            "func": "err"`;
        
        blocksString += '\n          },';
      }
    });
    
    // Remove trailing comma and close array
    blocksString = blocksString.slice(0, -1);
    blocksString += '\n        ],';
    
    return `    getInfo() {
      return {
        id: '${extension.id}',
        name: '${extension.name}',
        color1: '${extension.color1}',
        ${blocksString}
      };
    }`;
  }
  
  /**
   * Generates the entire extension file
   * @param {Object} extension - Extension configuration
   * @param {Array} blocks - Array of block definitions
   * @returns {string} - Generated extension file content
   */
  generateExtension(extension, blocks) {
    blocks = blocks.map(block => this.processBlock(block));
    const getInfoMethod = this.generateGetInfo(extension, blocks);
    const jsgpCode = this.generateJSGPCode(extension, blocks);
    const inputHandlerCode = this.generateInputHandlerCode(extension, blocks);
    const stgpCode = this.generateSTGPCode(extension, blocks);
    const stgpInputCode = this.generateSTGPInputHandlerCode(extension, blocks);
    
    // Generate the extension code
    const extensionCode = `${extension.comment}

(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("${extension.id} needs to be run unsandboxed.");
  }

  const {
    vm,
    BlockType,
    ArgumentType
  } = Scratch;
  const {
    runtime
  } = vm;
  const iwnafhwtb = vm.exports.i_will_not_ask_for_help_when_these_break();
  const {
    JSGenerator,
    IRGenerator,
    ScriptTreeGenerator
  } = iwnafhwtb;
  const {
    TYPE_NUMBER,
    TYPE_STRING,
    TYPE_BOOLEAN,
    TYPE_UNKNOWN,
    TYPE_NUMBER_NAN,
    TypedInput,
    ConstantInput,
    VariableInput,
    Frame,
    sanitize
  } = JSGenerator.unstable_exports;
  const JSGP = JSGenerator.prototype,
    IRGP = IRGenerator.prototype,
    STGP = ScriptTreeGenerator.prototype;

  ConstantInput.prototype.asRaw = function() {
    return this.constantValue;
  };
  TypedInput.prototype.asRaw = function() {
    return this.asUnknown();
  };
  TypedInput.prototype.asSafe = function() {
    return this.asUnknown();
  };
  VariableInput.prototype.asRaw = function() {
    return this._value.asRaw();
  };

  class ${extension.id} {
${getInfoMethod}
    err(args, util, blockJSON) {
      const err = 'huh, weird error :shrug:';
      runtime.visualReport(util.thread.isCompiled ? util.thread.peekStack() : util.thread.peekStackFrame().op.id, err);
      return err;
    }
  }

  const PATCHES_ID = '${extension.id}_patches';
  const cst_patch = (obj, functions) => {
    if (obj[PATCHES_ID]) return;
    obj[PATCHES_ID] = {};
    for (const name in functions) {
      const original = obj[name];
      obj[PATCHES_ID][name] = obj[name];
      if (original) {
        obj[name] = function(...args) {
          const callOriginal = (...args) => original.call(this, ...args);
          return functions[name].call(this, callOriginal, ...args);
        };
      } else {
        obj[name] = function(...args) {
          return functions[name].call(this, () => {}, ...args);
        };
      }
    }
  };

  const fakesanitize = (string) => {
    return string;
  };

  cst_patch(JSGP, {
    descendStackedBlock(fn, node, ...args) {
      const block = node.block;
      switch (node.kind) {${jsgpCode}
        default:
          return fn(node, ...args);
      }
    },

    descendInput(fn, node, ...args) {
      switch (node.kind) {${inputHandlerCode}
        default:
          return fn(node, ...args);
      }
    },
  });

  cst_patch(STGP, {
    descendStackedBlock(fn, block, ...args) {
      switch (block.opcode) {${stgpCode}
        default:
          return fn(block, ...args);
      }
    },

    descendInput(fn, block, ...args) {
      switch (block.opcode) {${stgpInputCode}
        default:
          return fn(block, ...args);
      }
    },
  });

  Scratch.extensions.register(new ${extension.id}());
})(Scratch);`;

    // Format the generated code using Prettier
    return formatCode(extensionCode);
  }
}

// Example usage
function generateExtensionFile(extConfig, blocks) {
  const generator = new ExtensionGenerator();
  return generator.generateExtension(extConfig, blocks);
}

// Export functionality
module.exports = {
  ExtensionGenerator,
  generateExtensionFile
};
