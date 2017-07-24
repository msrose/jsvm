'use strict';

const { WORD_SIZE, REGISTER_COUNT } = require('./constants');

const { loadFromBuffer, getElementsPerWord, Memory } = require('./memory');
const { fetch, increment, decode, execute } = require('./cpu');

const runCPUCycle = (memory, pc, registers) => {
  const ir = fetch(memory, pc);
  pc = increment(pc, memory);
  const operation = decode(ir);
  return execute(operation, registers, memory, pc);
};

const runProgram = (program) => {
  const elementsPerWord = getElementsPerWord(Memory.BYTES_PER_ELEMENT);
  const registers = Array(REGISTER_COUNT).fill().map(() => new Memory(elementsPerWord));
  const memory = new Memory(2 ** WORD_SIZE * elementsPerWord);
  const programLength = loadFromBuffer(memory, program);

  let pc = 0;
  while(pc <= programLength) {
    pc = runCPUCycle(memory, pc, registers);
  }

  console.log({ registers });
};

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

runProgram(program);
