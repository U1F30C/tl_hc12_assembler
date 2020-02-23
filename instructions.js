const directives = [
  {
    name: "start"
  },
  {
    name: "end"
  },
  {
    name: "org",
    expression: /^\$?([0-9A-Fa-f]{1-4})$/
  },
  {
    name: "equ",
    expression: /^\$?([0-9A-Fa-f]{1-4})$/
  },
  {
    name: "bsz",
    expression: /^\$?([0-9A-Fa-f]{1-4})$/
  },
  {
    name: "zmb",
    expression: /^\$?([0-9A-Fa-f]{1-4})$/
  },
  {
    name: "fill",
    expression: /^\$?([0-9A-Fa-f]{1-4}),([0-9A-Fa-f]{1-4})$/
  },
  {
    name: "fcb"
  },
  {
    name: "fcc"
  }
];

const addressingModes = [
  {
    //inherent
    type: "inh",
    testFunction: function(operandTokens) {
      return !operandTokens || operandTokens.length == 0;
    },
    length: 0
  },
  {
    //immediate8b
    type: "imm8",
    testFunction: function(operandTokens) {
      if (!/^#.*/.test(operandTokens[0])) return false;
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, 0, 2 ** 8 - 1);
    },
    length: 1
  },
  {
    //immediate16b
    type: "imm16",
    testFunction: function(operandTokens) {
      if (!/^#.*/.test(operandTokens[0])) return false;
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, 0, 2 ** 16 - 1);
    },
    length: 2
  },
  {
    //direct
    type: "dir",
    testFunction: function(operandTokens) {
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, 0, 2 ** 8 - 1);
    },
    length: 1
  },
  {
    //extended
    type: "ext",
    testFunction: function(operandTokens) {
      let numValue = parseNumber(operandTokens[0]);
      if (isNaN(numValue)) return false;
      return isInRange(numValue, 0, 2 ** 16 - 1);
    },
    length: 2
  }
];

const set = [
  {
    name: "aba",
    modes: [
      {
        type: "inh",
        opcode: "1806",
        cycles: 2
      }
    ]
  },
  // "abx",
  // "aby",
  {
    name: "adca",
    modes: [
      {
        type: "imm8",
        opcode: "89",
        cycles: 1
      },
      {
        type: "dir",
        opcode: "99",
        cycles: 3
      },
      {
        type: "ext",
        opcode: "b9",
        cycles: 3
      }
    ]
  },
  {
    name: "adcb",
    modes: [
      {
        type: "imm8",
        opcode: "c9",
        cycles: 1
      },
      {
        type: "dir",
        opcode: "d9",
        cycles: 3
      },
      {
        type: "ext",
        opcode: "f9",
        cycles: 3
      }
    ]
  },
  {
    name: "adda",
    modes: [
      {
        type: "imm8",
        opcode: "8b",
        cycles: 1
      },
      {
        type: "dir",
        opcode: "9b",
        cycles: 3
      },
      {
        type: "ext",
        opcode: "bb",
        cycles: 3
      }
    ]
  },
  {
    name: "addb",
    modes: [
      {
        type: "imm8",
        opcode: "cb",
        cycles: 1
      },
      {
        type: "dir",
        opcode: "db",
        cycles: 3
      },
      {
        type: "ext",
        opcode: "fb",
        cycles: 3
      }
    ]
  },
  {
    name: "addd",
    modes: [
      {
        type: "imm16",
        opcode: "c3",
        cycles: 2
      },
      {
        type: "dir",
        opcode: "d3",
        cycles: 3
      },
      {
        type: "ext",
        opcode: "f3",
        cycles: 3
      }
    ]
  },
  {
    name: "anda",
    modes: [
      {
        type: "imm8",
        opcode: "84",
        cycles: 1
      },
      {
        type: "dir",
        opcode: "94",
        cycles: 3
      },
      {
        type: "ext",
        opcode: "b4",
        cycles: 3
      }
    ]
  },
  {
    name: "andb",
    modes: [
      {
        type: "imm8",
        opcode: "c4",
        cycles: 1
      },
      {
        type: "dir",
        opcode: "d4",
        cycles: 3
      },
      {
        type: "ext",
        opcode: "f4",
        cycles: 3
      }
    ]
  },
  {
    name: "andcc",
    modes: [
      {
        type: "imm8",
        opcode: "10",
        cycles: 1
      }
    ]
  },
  {
    name: "asl",
    modes: [
      {
        type: "ext",
        opcode: "78",
        cycles: 4
      }
    ]
  },
  {
    name: "asla",
    modes: [
      {
        type: "inh",
        opcode: "48",
        cycles: 1
      }
    ]
  },
  {
    name: "aslb",
    modes: [
      {
        type: "inh",
        opcode: "58",
        cycles: 1
      }
    ]
  },
  {
    name: "asld",
    modes: [
      {
        type: "inh",
        opcode: "59",
        cycles: 1
      }
    ]
  },
  {
    name: "asr",
    modes: [
      {
        type: "ext",
        opcode: "77",
        cycles: 4
      }
    ]
  },
  {
    name: "bcc",
    modes: [
      {
        type: "inh",
        opcode: "47",
        cycles: 1
      }
    ]
  },
  {
    name: "bclr",
    modes: []
  },
  {
    name: "bcs",
    modes: []
  },
  {
    name: "beq",
    modes: []
  },
  {
    name: "bge",
    modes: []
  },
  {
    name: "bgnd",
    modes: []
  },
  {
    name: "bgt",
    modes: []
  },
  {
    name: "bhi",
    modes: []
  }
];

const findDirective = directiveName => {
  return directives.find(directive => {
    return directive.name == directiveName;
  });
};

const findInstruction = instructionName => {
  return set.find(instruction => {
    return instruction.name == instructionName;
  });
};

const findAddressingMode = addressingModeType => {
  return addressingModes.find(addressingMode => {
    return addressingMode.type == addressingModeType;
  });
};

function parseNumber(number) {
  number = number.replace("#", "");
  let radix;
  if (/^\$/.test(number)) radix = 16;
  else if (/^\@/.test(number)) radix = 8;
  else if (/^\%/.test(number)) radix = 2;
  else radix = 10;
  number = number.replace(/@|%|\$/, "");
  return parseInt(number, radix);
}

function isInRange(number, low, high) {
  return number >= low && number <= high;
}

exports.set = set;
exports.addressingModes = addressingModes;
exports.directives = directives;
exports.findDirective = findDirective;
exports.findInstruction = findInstruction;
exports.findAddressingMode = findAddressingMode;
exports.parseNumber = parseNumber;