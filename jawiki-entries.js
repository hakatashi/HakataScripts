const fs = require('fs');
const Xml = require('xml-stream');
const {hiraganize} = require('japanese');

const data = fs.readFileSync('data.txt').toString().split('\n').filter((line) => line).map((line) => line.split('\t'));
const dataMap = new Map(data);

const entries = new Map();
const reader = fs.createReadStream('jawiki-20180820-abstract.xml');
const xml = new Xml(reader, 'utf8');

xml.on('endElement: title', (tag) => {
	const word = tag.$text.replace(/^Wikipedia:/, '').trim();
	const rawWord = word.replace(/\(.+?\)$/, '').trim();
	if (rawWord.match(/^[\u3040-\u309F\u30A0-\u30FF・=]+$/)) {
		entries.set(word, hiraganize(rawWord.replace(/[・=]/g, '')));
	} else if (dataMap.has(word)) {
		entries.set(word, hiraganize(dataMap.get(word)));
	}
	if (entries.size % 1000 === 0) {
		console.log(entries.size);
	}
});

xml.on('end', () => {
	const writer = fs.createWriteStream('wikipedia.txt');

	for (const entry of entries) {
		writer.write(`${entry.join('\t')}\n`);
	}

	writer.end();
});
