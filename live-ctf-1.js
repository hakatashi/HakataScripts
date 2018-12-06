const input = 'Vl0vd2QyTXlVWFxYYUGwT1[r[GOkSm[1TVZOV10VbEOYa2L1VjKJRFVGWm[NajDxWjBaR3LySjWTbGinTWhCUVZucDd[V1KIVlusalKt`F8UW2N3[TZaeD0UTlSNazE1Wke1c3FGSoNkSEJXTUdRelmpRluXR0KITmxvW01DSUBVa2LxWkKGW0OuTlZhdmyYWWynU00xVoNXbXSXUjGKRWVteFOhVmqxV1ivW0KrbGhW`jZhZDZObmqF`GhmbXhZV1ZkLFQxUnNWcmKsTkB`cWlraENSbFqY[TZOaG[scHmWLWJHWkFaRlduWlFSRYBHVWqGU3SVVoNUcWisYlinVF[tMTCWMT05WWtj`lJuUlmZbF[hVjZ`eFRHZGyVbGw1VmWWU0XvLXKW`k5aTU[wWG[qRlGVLk5IWF0FT1JVbEWWbGP1TUG`Vk1VWk4RSDE5';
const ord = (char) => char.codePointAt(0);
const chr = (code) => String.fromCodePoint(code);

const hoge = (() => {
	const i = 0;
	const hoge = 100;

	if (i === 0) {
		return 'hoge';
	}

	return 'fuga';
})();

console.log(hoge);

let data = '';

for (const index of Array(Math.ceil(input.length / 10)).keys()) {
	const slice = input.slice(index * 10, index * 10 + 22);

	for (const n of Array(2 ** 22).keys()) {
		const fixedSlice = slice.split('').map((c, i) => chr(ord(c) ^ ((n >> i) & 1))).join('');
		let valid = true;
		let target = data + fixedSlice;

		for (const i of Array(10).keys()) {
			if (!target.match(/^[ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/]*$/)) {
				valid = false;
				break;
			}

			target = Buffer.from(target, 'base64').toString();
		}

		if (valid) {
			if (!target.match(/^[0-9a-zA-Z_{}]*$/)) {
				continue;
			}

			data += fixedSlice.slice(0, 10);
			console.log(target);
			break;
		}
	}

	if (data.length !== index * 10 + 10) {
		throw new Error();
	}
}