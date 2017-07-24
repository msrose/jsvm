'use strict';

const { WORD_SIZE, REGISTER_COUNT, WordWidthMemory, ByteWidthMemory } = require('./constants');
const { getMemoryValue, loadFromBuffer, getElementsPerWord } = require('./memory');
const instrs = require('./instrs');

// Default to byte-width so memory is byte-addressable
// Using word-width is useful for debugging, since instruction length matches memory width
const Memory = process.argv.includes('--word-width') ? WordWidthMemory : ByteWidthMemory;

const fetch = (memory, pc) => {
  return getMemoryValue(memory, pc);
};

const increment = (pc, memory) => {
  return pc + getElementsPerWord(memory.BYTES_PER_ELEMENT);
};

const decode = ir => {
  const opcode = ir & 0x000f;
  const decoder = instrs.getDecoderByOpcode(opcode);
  if(!decoder) {
    throw new Error(`Unrecognized opcode ${opcode}`);
  }
  const operation = decoder(ir);
  operation.opcode = opcode;
  return operation;
};

const execute = (operation, registers, memory, pc) => {
  const { opcode } = operation;
  const executer = instrs.getExecuterByOpcode(opcode);
  if(!executer) {
    throw new Error(`No executer for operation with opcode ${opcode}`);
  }
  const nextPC = executer(operation, registers, memory, pc, increment);
  if(Number.isInteger(nextPC)) {
    pc = nextPC;
  }
  return pc;
};

const runCycle = (memory, pc, registers) => {
  const ir = fetch(memory, pc);
  pc = increment(pc, memory);
  const operation = decode(ir);
  return execute(operation, registers, memory, pc);
};

const elementsPerWord = getElementsPerWord(Memory.BYTES_PER_ELEMENT);
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
