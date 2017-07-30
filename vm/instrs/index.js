'use strict';

const { readdirSync } = require('fs');
const { basename } = require('path');

const opcodes = {};
const decoders = {};
const executers = {};

const instrFiles = readdirSync(__dirname).filter(filename =>
  filename.indexOf('.') !== 0 && filename !== basename(__filename)
);

instrFiles.forEach(instrFile => {
  const { opcode, decoder, executer } = require(`./${instrFile}`);
  if(typeof opcode !== 'number') {
    throw new Error(`Instruction ${instrFile} exported invalid opcode ${opcode}`);
  }
  if(opcodes[opcode]) {
    throw new Error(`Instruction ${instrFile} exported duplicate opcode ${opcode}`);
  }
  if(typeof decoder !== 'function') {
    throw new Error(`Instruction ${instrFile} exported invalid decoder: must be a function`);
  }
  if(typeof executer !== 'function') {
    throw new Error(`Instruction ${instrFile} exported invalid executer: must be a function`);
  }
  opcodes[opcode] = true;
  decoders[opcode] = decoder;
  executers[opcode] = executer;
});

module.exports = {
  getDecoderByOpcode(opcode) {
    return decoders[opcode];
  },
  getExecuterByOpcode(opcode) {
    return executers[opcode];
  }
};
