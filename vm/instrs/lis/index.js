'use strict';

const { getMemoryValue, setMemoryValue } = require('../../memory');

const decoder = (ir) => {
  return {
    dest: (ir & 0x00f0) >> 4
  };
};

const executer = ({ dest }, registers, memory, pc, increment) => {
  const value = getMemoryValue(memory, pc);
  setMemoryValue(registers[dest], 0, value);
  pc = increment(pc, memory);
  return pc;
};

module.exports = {
  opcode: 0,
  decoder,
  executer
};
