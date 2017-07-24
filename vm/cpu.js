'use strict';

const { getMemoryValue, getElementsPerWord } = require('./memory');
const instrs = require('./instrs');

const fetch = (memory, pc) => {
  return getMemoryValue(memory, pc);
};

const increment = (pc, memory) => {
  return pc + getElementsPerWord(memory.BYTES_PER_ELEMENT);
};

const decode = ir => {
  const opcode = ir & 0x000f;
  const decoder = instrs.getDecoderByOpcode(opcode);
  if(!decoder) {
    throw new Error(`Unrecognized opcode ${opcode}`);
  }
  const operation = decoder(ir);
  operation.opcode = opcode;
  return operation;
};

const execute = (operation, registers, memory, pc) => {
  const { opcode } = operation;
  const executer = instrs.getExecuterByOpcode(opcode);
  if(!executer) {
    throw new Error(`No executer for operation with opcode ${opcode}`);
  }
  const nextPC = executer(operation, registers, memory, pc, increment);
  if(Number.isInteger(nextPC)) {
    pc = nextPC;
  }
  return pc;
};

module.exports = {
  fetch,
  increment,
  decode,
  execute
};
