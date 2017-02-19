buf = new Buffer(8);
buf.writeDoubleBE(-0, 0);
console.log(Array.from(buf).map(b => ('00000000' + b.toString(2)).slice(-8)).join(' '));
