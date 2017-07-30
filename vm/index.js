'use strict';

const { WORD_SIZE, REGISTER_COUNT, WordWidthMemory, ByteWidthMemory } = require('./constants');

const { loadFromBuffer, getElementsPerWord } = require('./memory');
const { fetch, increment, decode, execute } = require('./cpu');

const runCPUCycle = (memory, pc, registers) => {
  const ir = fetch(memory, pc);
  pc = increment(pc, memory);
  const operation = decode(ir);
  return execute(operation, registers, memory, pc);
};

const run = (program, { wordWidth = false } = {}) => {
  // Default to byte-width so memory is byte-addressable
  // Using word-width is useful for debugging, since instruction length matches memory width
  const Memory = wordWidth ? WordWidthMemory : ByteWidthMemory;

  const elementsPerWord = getElementsPerWord(Memory.BYTES_PER_ELEMENT);
  const registers = Array(REGISTER_COUNT).fill().map(() => new Memory(elementsPerWord));
  const memory = new Memory(2 ** WORD_SIZE * elementsPerWord);
  const programLength = loadFromBuffer(memory, program);

  let pc = 0;
  while(pc <= programLength) {
    pc = runCPUCycle(memory, pc, registers);
  }

  return registers;
};

module.exports = {
  run
};
