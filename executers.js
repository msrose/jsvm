'use strict';

const { LIS, ADD } = require('./constants').INSTRUCTIONS;
const { getMemoryValue, setMemoryValue } = require('./memory');

const executers = {
  [LIS]({ dest }, registers, memory, pc, increment) {
    const value = getMemoryValue(memory, pc);
    setMemoryValue(registers[dest], 0, value);
    pc = increment(pc);
    return pc;
  },
  [ADD]({ op1, op2, dest }, registers) {
    const sum = getMemoryValue(registers[op1]) + getMemoryValue(registers[op2]);
    setMemoryValue(registers[dest], 0, sum);
  }
};

module.exports = {
  get(opcode) {
    return executers[opcode];
  }
};
