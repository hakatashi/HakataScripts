const pako = require('pako');
const zlib = require('zlib');

const data = Buffer.from("[CENSORED]", 'hex');
const result = pako.inflateRaw(data);
console.log(Buffer.from(result).toString().replace(/た/g, ''));
console.log(zlib.inflateRawSync(data).toString().replace(/た/g, ''));
