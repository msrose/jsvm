'use strict';

const { LIS, ADD } = require('./constants').INSTRUCTIONS;

const decoders = {
  [LIS](ir) {
    return {
      dest: (ir & 0x00f0) >> 4
    };
  },
  [ADD](ir) {
    return {
      op1: (ir & 0xf000) >> 12,
      op2: (ir & 0x0f00) >> 8,
      dest: (ir & 0x00f0) >> 4
    };
  }
};

module.exports = {
  get(opcode) {
    return decoders[opcode];
  }
};
