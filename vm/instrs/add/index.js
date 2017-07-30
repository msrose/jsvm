'use strict';

const { getMemoryValue, setMemoryValue } = require('../../memory');

const decoder = (ir) => {
  return {
    op1: (ir & 0xf000) >> 12,
    op2: (ir & 0x0f00) >> 8,
    dest: (ir & 0x00f0) >> 4
  };
};

const executer = ({ op1, op2, dest }, registers) => {
  const sum = getMemoryValue(registers[op1]) + getMemoryValue(registers[op2]);
  setMemoryValue(registers[dest], 0, sum);
};

module.exports = {
  opcode: 1,
  decoder,
  executer
};
