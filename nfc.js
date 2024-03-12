const unorm = require('unorm');
const fs = require('fs');

for (const i of Array(0x110000).keys()) {
	if (i < 0x80) {
		continue;
	}
	const nfc = unorm.nfc(String.fromCodePoint(i));
	if (nfc.match(/[\x00-\x80]/)) {
		console.log(i.toString(16));
	}
}

