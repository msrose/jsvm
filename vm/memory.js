'use strict';

const { WORD_SIZE, BYTE_SIZE, WordWidthMemory, ByteWidthMemory } = require('./constants');

const BYTES_PER_WORD = WORD_SIZE / BYTE_SIZE;

// Default to byte-width so memory is byte-addressable
// Using word-width is useful for debugging, since instruction length matches memory width
const Memory = process.argv.includes('--word-width') ? WordWidthMemory : ByteWidthMemory;

const getElementsPerWord = (bytesPerElement) => {
  return BYTES_PER_WORD / bytesPerElement;
};

const getMemoryValue = (memory, address = 0) => {
  let value = 0;
  const ELEMENTS_PER_WORD = getElementsPerWord(memory.BYTES_PER_ELEMENT);
  const BITS_PER_ELEMENT = memory.BYTES_PER_ELEMENT * BYTE_SIZE;
  for(let i = 0; i < ELEMENTS_PER_WORD; i++) {
    const lshift = BITS_PER_ELEMENT;
    value = (value << lshift) | memory[i + address];
  }
  return value;
};

const setMemoryValue = (memory, address, value) => {
  const ELEMENTS_PER_WORD = getElementsPerWord(memory.BYTES_PER_ELEMENT);
  const BITS_PER_ELEMENT = memory.BYTES_PER_ELEMENT * BYTE_SIZE;
  const ELEMENT_MASK = 2 ** BITS_PER_ELEMENT - 1;
  for(let i = 0; i < ELEMENTS_PER_WORD; i++) {
    const rshift = (ELEMENTS_PER_WORD - 1 - i) * BITS_PER_ELEMENT;
    memory[i + address] = (value >> rshift) & ELEMENT_MASK;
  }
};

const loadFromBuffer = (memory, program) => {
  const programLength = Buffer.byteLength(program) / memory.BYTES_PER_ELEMENT;
  for(let i = 0; i < programLength; i++) {
    const value = getMemoryValue(program, i * memory.BYTES_PER_ELEMENT);
    setMemoryValue(memory, i, value);
  }
  return programLength;
};

module.exports = {
  Memory,
  getMemoryValue,
  setMemoryValue,
  loadFromBuffer,
  getElementsPerWord
};
