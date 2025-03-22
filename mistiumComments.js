/* Name: MistFetch
Author: Mistium
Description: my fetch extension for http and stuff cos i needed a better one for originOS

License: MPL-2.0
This Source Code is subject to the terms of the Mozilla Public License, v2.0,
If a copy of the MPL was not distributed with this file,
Then you can obtain one at https://mozilla.org/MPL/2.0/ */

(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("mistiumComments needs to be run unsandboxed.");
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

  class mistiumComments {
    getInfo() {
      return {
        id: 'mistiumComments',
        name: 'Comments',
        color1: '#146fa6',
        blocks: [
  {
    "blockType": "Scratch.BlockType.LABEL",
    "text": "Single line comment"
  },
  {
    "opcode": "blockcomment",
    "blockType": "Scratch.BlockType.COMMAND",
    "text": "// [comment]",
    "code": "// ${ZnebTuxQsko}",
    "func": "err",
    "arguments": {
      "comment": {
        "type": "Scratch.ArgumentType.STRING",
        "gen_id": "ZnebTuxQsko"
      }
    }
  },
  {
    "opcode": "Ccomment",
    "blockType": "Scratch.BlockType.CONDITIONAL",
    "text": "// [comment]",
    "code": "true",
    "func": "err",
    "returns": "BOOLEAN",
    "arguments": {
      "comment": {
        "type": "Scratch.ArgumentType.STRING",
        "gen_id": "IFlQlUfewpy"
      }
    }
  },
  {
    "opcode": "booleancomment",
    "blockType": "Scratch.BlockType.BOOLEAN",
    "text": "[boolean] // [comment]",
    "code": "${QPUvzDOuuyS}",
    "func": "err",
    "returns": "BOOLEAN",
    "arguments": {
      "boolean": {
        "type": "Scratch.ArgumentType.BOOLEAN",
        "gen_id": "QPUvzDOuuyS"
      },
      "comment": {
        "type": "Scratch.ArgumentType.STRING",
        "gen_id": "ISOnCoJfInz"
      }
    }
  },
  {
    "opcode": "reportercomment",
    "blockType": "Scratch.BlockType.REPORTER",
    "text": "[reporter] // [comment]",
    "code": "${LXJyJHgPXPF}",
    "func": "err",
    "returns": "STRING",
    "allowDropAnywhere": true,
    "arguments": {
      "reporter": {
        "type": "Scratch.ArgumentType.STRING",
        "gen_id": "LXJyJHgPXPF"
      },
      "comment": {
        "type": "Scratch.ArgumentType.STRING",
        "gen_id": "IFAWAiqAzgV"
      }
    }
  },
  "---",
  {
    "blockType": "Scratch.BlockType.LABEL",
    "text": "Multi line comment"
  },
  {
    "opcode": "openMutlilineComment",
    "blockType": "Scratch.BlockType.COMMAND",
    "text": "Open Mutliline Comment",
    "code": "/*",
    "func": "err"
  },
  {
    "opcode": "closeMultilineComment",
    "blockType": "Scratch.BlockType.COMMAND",
    "text": "Close Multiline Comment",
    "code": "*/",
    "func": "err"
  }

        ],
      };
    }
    err(args, util, blockJSON) {
      const err = 'huh, weird error :shrug:';
      runtime.visualReport(util.thread.isCompiled ? util.thread.peekStack() : util.thread.peekStackFrame().op.id, err);
      return err;
    }
  }

  const PATCHES_ID = 'mistiumComments_patches';
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
      switch (node.kind) {
        case 'mistiumComments.blockcomment':
          const undefined = this.descendInput(node?.comment).asString();
          this.source += `\n// [comment];\n`;
          return;

        case 'mistiumComments.Ccomment':
          const undefined = this.descendInput(node?.comment).asString();
          this.source += `\ntrue;\n`;
          return;

        case 'mistiumComments.booleancomment':
          const undefined = this.descendInput(node?.boolean).asBoolean();
          const undefined = this.descendInput(node?.comment).asString();

        case 'mistiumComments.reportercomment':
          const undefined = this.descendInput(node?.reporter).asString();
          const undefined = this.descendInput(node?.comment).asString();

        case 'mistiumComments.openMutlilineComment':
          this.source += `\n/*;\n`;
          return;

        case 'mistiumComments.closeMultilineComment':
          this.source += `\n*/;\n`;
          return;

        default:
          return fn(node, ...args);
      }
    },

    descendInput(fn, node, ...args) {
      switch (node.kind) {
        case 'mistiumComments.blockcomment':
          const undefined = this.descendInput(node?.comment).asString();
          return new TypedInput(`// [comment]`, TYPE_UNKNOWN);

        case 'mistiumComments.Ccomment':
          const undefined = this.descendInput(node?.comment).asString();
          return new TypedInput(`true`, TYPE_BOOLEAN);

        case 'mistiumComments.booleancomment':
          const undefined = this.descendInput(node?.boolean).asBoolean();
          const undefined = this.descendInput(node?.comment).asString();
          return new TypedInput(`[boolean]`, TYPE_BOOLEAN);

        case 'mistiumComments.reportercomment':
          const undefined = this.descendInput(node?.reporter).asString();
          const undefined = this.descendInput(node?.comment).asString();
          return new TypedInput(`[reporter]`, TYPE_STRING);

        case 'mistiumComments.openMutlilineComment':
          return new TypedInput(`/*`, TYPE_UNKNOWN);

        case 'mistiumComments.closeMultilineComment':
          return new TypedInput(`*/`, TYPE_UNKNOWN);

        default:
          return fn(node, ...args);
      }
    },
  });

  cst_patch(STGP, {
    descendStackedBlock(fn, block, ...args) {
      switch (block.opcode) {
        case 'mistiumComments_blockcomment':
          return {
            block, kind: 'mistiumComments.blockcomment',
              comment: this.descendInputOfBlock(block, 'comment'),
          };

        case 'mistiumComments_Ccomment':
          return {
            block, kind: 'mistiumComments.Ccomment',
              comment: this.descendInputOfBlock(block, 'comment'),
          };

        case 'mistiumComments_booleancomment':
          return {
            block, kind: 'mistiumComments.booleancomment',
              boolean: this.descendInputOfBlock(block, 'boolean'),
              comment: this.descendInputOfBlock(block, 'comment'),
          };

        case 'mistiumComments_reportercomment':
          return {
            block, kind: 'mistiumComments.reportercomment',
              reporter: this.descendInputOfBlock(block, 'reporter'),
              comment: this.descendInputOfBlock(block, 'comment'),
          };

        case 'mistiumComments_openMutlilineComment':
          return {
            block, kind: 'mistiumComments.openMutlilineComment',
          };

        case 'mistiumComments_closeMultilineComment':
          return {
            block, kind: 'mistiumComments.closeMultilineComment',
          };

        default:
          return fn(block, ...args);
      }
    },

    descendInput(fn, block, ...args) {
      switch (block.opcode) {
        case 'mistiumComments_blockcomment':
          return {
            block,
            kind: 'mistiumComments.blockcomment',
              comment: this.descendInputOfBlock(block, 'comment'),
          };

        case 'mistiumComments_Ccomment':
          return {
            block,
            kind: 'mistiumComments.Ccomment',
              comment: this.descendInputOfBlock(block, 'comment'),
          };

        case 'mistiumComments_booleancomment':
          return {
            block,
            kind: 'mistiumComments.booleancomment',
              boolean: this.descendInputOfBlock(block, 'boolean'),
              comment: this.descendInputOfBlock(block, 'comment'),
          };

        case 'mistiumComments_reportercomment':
          return {
            block,
            kind: 'mistiumComments.reportercomment',
              reporter: this.descendInputOfBlock(block, 'reporter'),
              comment: this.descendInputOfBlock(block, 'comment'),
          };

        case 'mistiumComments_openMutlilineComment':
          return {
            block,
            kind: 'mistiumComments.openMutlilineComment',
          };

        case 'mistiumComments_closeMultilineComment':
          return {
            block,
            kind: 'mistiumComments.closeMultilineComment',
          };

        default:
          return fn(block, ...args);
      }
    },
  });

  Scratch.extensions.register(new mistiumComments());
})(Scratch);