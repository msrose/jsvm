'use strict';

const { WORD_SIZE, REGISTER_COUNT } = require('./constants');
const { getMemoryValue, setMemoryValue, loadFromBuffer, getElementsPerWord } = require('./memory');

const Memory = Uint8Array; // or Uint16Array
const elementsPerWord = getElementsPerWord(Memory.BYTES_PER_ELEMENT);

const INSTRS = {
  LIS: 0,
  ADD: 1
};

const fetch = (memory, pc) => {
  return getMemoryValue(memory, pc);
};

const increment = pc => {
  return pc + elementsPerWord;
};

const decode = ir => {
  const opcode = ir & 0x000f;
  const instr = { opcode };
  switch(opcode) {
    case INSTRS.LIS:
      instr.dest = (ir & 0x00f0) >> 4;
      break;
    case INSTRS.ADD:
      instr.op1 = (ir & 0xf000) >> 12;
      instr.op2 = (ir & 0x0f00) >> 8;
      instr.dest = (ir & 0x00f0) >> 4;
      break;
    default:
      throw new Error(`Unrecognized opcode ${opcode}`);
  }
  return instr;
};

const execute = (instr, registers, memory, pc) => {
  switch(instr.opcode) {
    case INSTRS.LIS: {
      const value = getMemoryValue(memory, pc);
      setMemoryValue(registers[instr.dest], 0, value);
      pc = increment(pc);
      break;
    }
    case INSTRS.ADD: {
      const { op1, op2, dest } = instr;
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
  const instr = decode(ir);
  return execute(instr, registers, memory, pc);
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
