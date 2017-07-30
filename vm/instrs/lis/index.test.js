'use strict';

const { run } = require('../../index');

describe('LIS instruction', () => {
  describe('when using byte-width memory', () => {
    it('loads the next value in memory into a register', () => {
      const program = Buffer.from([
        // LIS $1
        0x00, 0x10,
        // The value to go into $1
        0x23, 0xf4
      ]);
      const registers = run(program);
      expect(registers[1][0]).toBe(0x23);
      expect(registers[1][1]).toBe(0xf4);
    });
  });

  describe('when using word-width memory', () => {
    it('loads the next value in memory into a register', () => {
      const program = Buffer.from([
        // LIS $1
        0x00, 0x10,
        // The value to go into $1
        0x23, 0xf4
      ]);
      const registers = run(program, { wordWidth: true });
      expect(registers[1][0]).toBe(0x23f4);
    });
  });
});
