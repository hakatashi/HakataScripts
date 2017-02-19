const foo = require('./dep.js');

console.log('foo has been initiated in loader2.');
console.log(foo.bar);

foo.bar = 20;

console.log('foo.bar has been set to 20.');
console.log(foo.bar);

module.exports = foo;

