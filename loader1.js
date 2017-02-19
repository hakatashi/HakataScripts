const foo = require('./dep.js');

console.log('foo has been initiated in loader1.');
console.log(foo.bar);

foo.bar = 10;

console.log('foo.bar has been set to 10.');
console.log(foo.bar);

module.exports = foo;

