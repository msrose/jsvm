'use strict';

const { INSTRS } = require('../constants');

const decoders = {};
const executers = {};

Object.keys(INSTRS).forEach(instr => {
  const { opcode, decoder, executer } = require(`./${instr.toLowerCase()}`);
  if(opcode !== INSTRS[instr]) {
    throw new Error(`Instruction ${instr} exported opcode ${opcode} which does not match config value`);
  }
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
