#!/usr/bin/node
let fs = require("fs");

let result = "";
let pc = 0;
let tags = [];

const instructions = require("./instructions");

const addressingModesExpressions = instructions.addressingModes;
const directives = instructions.directives;
const isMnemonic = instructions.isMnemonic;
const isDirective = instructions.isDirective;
const instructionSet = instructions.set;

let addressingMode = (instructionTokens) => {
  const [instructionName, ...operands] = instructionTokens
  let instructionInfo = instructionSet.find(instruction => {
    return instruction.name == instructionName;
  });
  let mode = null;
  instructionInfo.modes.forEach(currentMode => {
    let expression = addressingModesExpressions.find(addressingExpression => {
      return addressingExpression.type == currentMode.type;
    });
    if (
      expression &&
      expression.expression.test(operands[0] ? operands[0] : "")
    ) {
      mode = currentMode;
    }
  });
  if (mode) return mode;
  else return { type: "err" };
};

function preprocessString(data) {
  let processedData = data.replace(/\t/g, " ");
  processedData = processedData.replace(/ +/g, " ");
  processedData = processedData.replace(/;.*\n/g, "\n");
  processedData = processedData.toLowerCase();
  return processedData;
}

function parseNumber(number) {
  number = number.replace("#", "");
  if (/^\$/.test(number)) return parseInt(number.replace("$", ""), 16);
  else return parseInt(number, 10);
}

function processDirective(directive) {
  if (directive[0] == "org") {
    pc = parseNumber(directive[1]);
    result += parseNumber(directive[1]).toString(16) + "\n";
  }
  if (directive[0] == "bsz") {
    result += pc.toString(16) + " ";
    for (let i = 0; i < parseNumber(directive[1]); i++) result += "00 ";
    result += "\n";
    pc += parseNumber(directive[1]);
  }
  if (directive[0] == "fcb") {
    result += pc.toString(16) + " ";
    parameters = directive.slice(1);
    parameters.forEach(element => {
      result += element + " ";
    });
    result += "\n";
    pc += parameters.length;
  }
  if (directive[0] == "fcc") {
    result += pc.toString(16) + " ";
    for (let i = 1; i < directive[1].length - 1; i++) {
      result += directive[1].charCodeAt(i) + " ";
    }
    result += "\n";
    pc += directive[1].length - 2;
  }
  if (directive[0] == "equ") {
    tags[tags.length - 1].address = parseNumber(directive[1]);
  }
}

let analyseInstruction = (instructionTokens, _index) => {
  if (instructionTokens[0])
    if (isMnemonic(instructionTokens[0])) {
      result += `\tInstruction: ${instructionTokens[0]}\n`;
      let operands = instructionTokens.slice(1);
      let mode = addressingMode(instructionTokens);
      if (mode.type != "err") {
        instructionSize =
          Math.ceil(mode.opcode.length / 2) +
          addressingModesExpressions.find(amode => {
            return amode.type == mode.type;
          }).length;
        result += `\tMode: ${mode.type}\n`;
        result += `${pc.toString(16)} ${mode.opcode} ${
          operands[0] ? parseNumber(operands[0]).toString(16) : ""
        }\n`;
        pc += instructionSize;
      } else {
        result += "\tInvalid addressing mode\n";
      }
    } else if (isDirective(instructionTokens[0]))
      processDirective(instructionTokens);
    else if (instructionTokens[0])
      result += `Error: invalid token ${instruction[0]}\n`;
};

let analyseLine = (line, _index) => {
  if (line != "") {
    let tokens = line.split(" ");
    if (tokens[0] != "") {
      tags.push({ tag: tokens[0], address: pc });
    }
    analyseInstruction(tokens.slice(1));
  }
  result += "\n";
};

if (process.argv.length < 3) {
  console.log("Usage: assembler [FILE]");
  process.exit(1);
}
let filename = process.argv[2];

fs.readFile(filename, "utf8", (error, rawData) => {
  if (error) console.log(error);
  else {
    let data = preprocessString(rawData);
    let instructions = data.split("\n");
    instructions.forEach((line, lineIndex) => {
      analyseLine(line, lineIndex);
    });
    tags.forEach(tag => {
      console.log(tag.tag, tag.address.toString(16));
      data = data.replace(" " + tag.tag, " $" + tag.address.toString(16));
    });
    instructions = data.split("\n");
    result = "";
    instructions.forEach((line, lineIndex) => {
      analyseLine(line, lineIndex);
    });
    console.log(result.toUpperCase());
  }
});
