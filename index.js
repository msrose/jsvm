'use strict';

const Memory = Uint8Array; // or Uint16Array
const WORD_SIZE = 16;
const BYTE_SIZE = 8;
const BYTES_PER_WORD = WORD_SIZE / BYTE_SIZE;
const ELEMENTS_PER_WORD = BYTES_PER_WORD / Memory.BYTES_PER_ELEMENT;
const ADDRESS_COUNT = 2 ** WORD_SIZE;
const REGISTER_COUNT = 4;
const INSTRS = {
  LIS: 0,
  ADD: 1
};

const getMemoryValue = (memory, address = 0) => {
  let value = 0;
  const ELEMENTS_PER_WORD = BYTES_PER_WORD / memory.BYTES_PER_ELEMENT;
  const BITS_PER_ELEMENT = memory.BYTES_PER_ELEMENT * BYTE_SIZE;
  for(let i = 0; i < ELEMENTS_PER_WORD; i++) {
    const lshift = BITS_PER_ELEMENT;
    value = (value << lshift) | memory[i + address];
  }
  return value;
};

const setMemoryValue = (memory, address, value) => {
  const ELEMENTS_PER_WORD = BYTES_PER_WORD / memory.BYTES_PER_ELEMENT;
  const BITS_PER_ELEMENT = memory.BYTES_PER_ELEMENT * BYTE_SIZE;
  const ELEMENT_MASK = 2 ** BITS_PER_ELEMENT - 1;
  for(let i = 0; i < ELEMENTS_PER_WORD; i++) {
    const rshift = (ELEMENTS_PER_WORD - 1 - i) * BITS_PER_ELEMENT;
    memory[i + address] = (value >> rshift) & ELEMENT_MASK;
  }
};

const fetch = (memory, pc) => {
  return getMemoryValue(memory, pc);
};

const increment = pc => {
  return pc + ELEMENTS_PER_WORD;
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
  let ir = fetch(memory, pc);
  pc = increment(pc);
  const instr = decode(ir);
  return execute(instr, registers, memory, pc);
};

const registers = Array(REGISTER_COUNT).fill().map(() => new Memory(ELEMENTS_PER_WORD));
const memory = new Memory(ADDRESS_COUNT * ELEMENTS_PER_WORD);

const program = new Buffer.from([
  0x00, 0x10, 0x00, 0xf4, // load value into $1
  0x00, 0x20, 0x00, 0xf4, // load value into $2
  0x12, 0x31              // $3 = $1 + $2
]);

const programLength = Buffer.byteLength(program) / Memory.BYTES_PER_ELEMENT;

for(let i = 0; i < programLength; i++) {
  const value = getMemoryValue(program, i * Memory.BYTES_PER_ELEMENT);
  setMemoryValue(memory, i, value);
}

let pc = 0;
while(pc <= programLength) {
  pc = runCycle(memory, pc, registers);
}

console.log({ registers });
