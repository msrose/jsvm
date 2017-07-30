'use strict';

const { run } = require('../../index');

describe('ADD instruction', () => {
  describe('when using byte-width memory', () => {
    it('adds values in two registers together and stores the result', () => {
      const program = new Buffer.from([
        // load value into $1
        0x00, 0x10,
        0x00, 0xf4,
        // load value into $2
        0x00, 0x20,
        0x00, 0xf4,
        // $3 = $1 + $2
        0x12, 0x31
      ]);
      const registers = run(program);
      expect(registers[3][0]).toBe(0x01);
      expect(registers[3][1]).toBe(0xe8);
    });
  });

  describe('when using word-width memory', () => {
    it('adds values in two registers together and stores the result', () => {
      const program = new Buffer.from([
        // load value into $1
        0x00, 0x10,
        0x00, 0xf4,
        // load value into $2
        0x00, 0x20,
        0x00, 0xf4,
        // $3 = $1 + $2
        0x12, 0x31
      ]);
      const registers = run(program, { wordWidth: true });
      expect(registers[3][0]).toBe(0x01e8);
    });
  });
});
