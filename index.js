'use strict';

const { WORD_SIZE, REGISTER_COUNT, INSTRUCTIONS: INSTRS, WordWidthMemory, ByteWidthMemory } = require('./constants');
const { getMemoryValue, setMemoryValue, loadFromBuffer, getElementsPerWord } = require('./memory');
const decoders = require('./decoders');

// Default to byte-width so memory is byte-addressable
// Using word-width will be useful for debugging
const Memory = process.argv.includes('--word-width') ? WordWidthMemory : ByteWidthMemory;
const elementsPerWord = getElementsPerWord(Memory.BYTES_PER_ELEMENT);

const fetch = (memory, pc) => {
  return getMemoryValue(memory, pc);
};

const increment = pc => {
  return pc + elementsPerWord;
};

const decode = ir => {
  const opcode = ir & 0x000f;
  const decoder = decoders.get(opcode);
  if(!decoder) {
    throw new Error(`Unrecognized opcode ${opcode}`);
  }
  const operation = decoder(ir);
  operation.opcode = opcode;
  return operation;
};

const execute = (operation, registers, memory, pc) => {
  switch(operation.opcode) {
    case INSTRS.LIS: {
      const value = getMemoryValue(memory, pc);
      setMemoryValue(registers[operation.dest], 0, value);
      pc = increment(pc);
      break;
    }
    case INSTRS.ADD: {
      const { op1, op2, dest } = operation;
      const sum = getMemoryValue(registers[op1]) + getMemoryValue(registers[op2]);
      setMemoryValue(registers[dest], 0, sum);
      break;
    }
  }
  return pc;
};

const runCycle = (memory, pc, registers) => {
  const ir = fetch(memory, pc);
  pc = increment(pc);
  const operation = decode(ir);
  return execute(operation, registers, memory, pc);
};

const registers = Array(REGISTER_COUNT).fill().map(() => new Memory(elementsPerWord));
const memory = new Memory(2 ** WORD_SIZE * elementsPerWord);

const program = new Buffer.from([
  0x00, 0x10,
  0x00, 0xf4, // load value into $1
  0x00, 0x20,
  0x00, 0xf4, // load value into $2
  0x12, 0x31 // $3 = $1 + $2
]);

const programLength = loadFromBuffer(memory, program);

let pc = 0;
while(pc <= programLength) {
  pc = runCycle(memory, pc, registers);
}

console.log({ registers });
