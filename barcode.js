const fs = require('fs');
const {chunk, zip, flatten} = require('lodash');

const blocks = {
    '0000': ' ',
    '1000': '▘',
    '0100': '▝',
    '1100': '▀',
    '0010': '▖',
    '1010': '▌',
    '0110': '▞',
    '1110': '▛',
    '0001': '▗',
    '1001': '▚',
    '0101': '▐',
    '1101': '▜',
    '0011': '▄',
    '1011': '▙',
    '0111': '▟',
    '1111': '█',
}

const data = fs.readFileSync('barcode.pbm');
const bits = data.toString().split('\n').map((l) => l.split(' ').concat(['0'])).slice(0, -1).concat([Array(22).fill('0')]);
for (const index of Array(Math.floor(bits.length / 2)).keys()) {
    const line1 = chunk(bits[index * 2], 2);
    const line2 = chunk(bits[index * 2 + 1], 2);
    const codels = zip(line1, line2);
    console.log(codels.map((codel) => blocks[flatten(codel).join('')]).join(''))
}
