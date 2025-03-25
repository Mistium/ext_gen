/**
 * Scratch 3 Extension Generator
 * Creates formatted extension files based on JSON configuration
 */

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
      for (const argName in block.arguments) {
        const argConfig = block.arguments[argName];
        const genId = this.generateRandomId();
        
        processedBlock.arguments[argName] = {
          "type": this.argTypeMap[argConfig.type],
          "gen_id": genId
        };
        
        // Process code to replace argument placeholder with gen_id reference
        if (processedBlock.code) {
          processedBlock.code = processedBlock.code.replace(`[${argName}]`, `\${${genId}}`);
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
      
      const opcode = block.opcode;
      let blockCode = `\n        case '${extension.id}.${opcode}':\n`;
      
      // Add code for each argument
      if (block.arguments) {
        for (const argName in block.arguments) {
          const genId = block.arguments[argName].gen_id;
          const argType = block.arguments[argName].type.split('.').pop().toLowerCase();
          let method = 'asString';
          
          if (argType === 'number') method = 'asNumber';
          else if (argType === 'boolean') method = 'asBoolean';
          
          blockCode += `          const ${genId} = this.descendInput(node?.${argName}).${method}();\n`;
        }
      }
      
      // Add appropriate return statement based on block type
      if (block.blockType.endsWith('COMMAND') || block.blockType.endsWith('CONDITIONAL')) {
        blockCode += `          this.source += \`\\n${block.code};\\n\`;\n`;
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
      
      const opcode = block.opcode;
      let blockCode = `\n        case '${extension.id}.${opcode}':\n`;
      
      // Add code for each argument
      if (block.arguments) {
        for (const argName in block.arguments) {
          const genId = block.arguments[argName].gen_id;
          const argType = block.arguments[argName].type.split('.').pop().toLowerCase();
          let method = 'asString';
          
          if (argType === 'number') method = 'asNumber';
          else if (argType === 'boolean') method = 'asBoolean';
          
          blockCode += `          const ${genId} = this.descendInput(node?.${argName}).${method}();\n`;
        }
      }
      
      let returnType = 'TYPE_UNKNOWN';
      if (block.returns === 'STRING') returnType = 'TYPE_STRING';
      else if (block.returns === 'BOOLEAN') returnType = 'TYPE_BOOLEAN';
      
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
      
      const opcode = block.opcode;
      let blockCode = `\n        case 'mistiumComments_${opcode}':\n`;
      blockCode += `          return {\n            block, kind: 'mistiumComments.${opcode}',\n`;
      
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
   * Generates input handling code for STGP
   * @param {Object} extension - Object of extension details
   * @param {Array} blocks - Array of block definitions
   * @returns {string} - Generated code for STGP input handlers
   */
  generateSTGPInputHandlerCode(extension, blocks) {
    let code = '';
    
    blocks.forEach(block => {
      if (typeof block === 'string') return; // Skip labels and separators
      
      const opcode = block.opcode;
      let blockCode = `\n        case 'mistiumComments_${opcode}':\n`;
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
    const processedBlocks = blocks.map(block => this.processBlock(block));
    
    return `    getInfo() {
      return {
        id: '${extension.id}',
        name: '${extension.name}',
        color1: '${extension.color1}',
        blocks: [${JSON.stringify(processedBlocks, null, 2).slice(1, -1)}
        ],
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
    const getInfoMethod = this.generateGetInfo(extension, blocks);
    const jsgpCode = this.generateJSGPCode(extension, blocks);
    const inputHandlerCode = this.generateInputHandlerCode(extension, blocks);
    const stgpCode = this.generateSTGPCode(extension, blocks);
    const stgpInputCode = this.generateSTGPInputHandlerCode(extension, blocks);
    
    return `${extension.comment}

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
