'use strict';

const vm = require('.');

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

vm.run(program);
