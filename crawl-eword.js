const cheerioReq = require('cheerio-req');
const axios = require('axios');
const scrape = require('scrape-it');
const URL = require('url');
const iconv = require('iconv-lite');
const fs = require('fs');
const {hiraganize} = require('japanese');
const {promisify} = require('util');

const pages = [
	'p/i-a.html',
	'p/i-b.html',
	'p/i-c.html',
	'p/i-d.html',
	'p/i-e.html',
	'p/i-f.html',
	'p/i-g.html',
	'p/i-h.html',
	'p/i-i.html',
	'p/i-j.html',
	'p/i-k.html',
	'p/i-l.html',
	'p/i-m.html',
	'p/i-n.html',
	'p/i-o.html',
	'p/i-p.html',
	'p/i-q.html',
	'p/i-r.html',
	'p/i-s.html',
	'p/i-t.html',
	'p/i-u.html',
	'p/i-v.html',
	'p/i-w.html',
	'p/i-xyz.html',
	'p/i-kaa.html',
	'p/i-kai.html',
	'p/i-kau.html',
	'p/i-kae.html',
	'p/i-kao.html',
	'p/i-kka.html',
	'p/i-kki.html',
	'p/i-kku.html',
	'p/i-kke.html',
	'p/i-kko.html',
	'p/i-ksa.html',
	'p/i-ksi.html',
	'p/i-ksu.html',
	'p/i-kse.html',
	'p/i-kso.html',
	'p/i-kta.html',
	'p/i-kti.html',
	'p/i-ktu.html',
	'p/i-kte.html',
	'p/i-kto.html',
	'p/i-kna.html',
	'p/i-kninu.html',
	'p/i-kninu.html',
	'p/i-kne.html',
	'p/i-kno.html',
	'p/i-kha.html',
	'p/i-khi.html',
	'p/i-khu.html',
	'p/i-khe.html',
	'p/i-kho.html',
	'p/i-kma.html',
	'p/i-kmi.html',
	'p/i-kmu.html',
	'p/i-kme.html',
	'p/i-kmo.html',
	'p/i-kyayuyo.html',
	'p/i-kyayuyo.html',
	'p/i-kyayuyo.html',
	'p/i-kra.html',
	'p/i-kri.html',
	'p/i-kru.html',
	'p/i-kre.html',
	'p/i-kro.html',
	'p/i-kwa.html',
	'p/i-ns.html',
];

cheerioReq.request = (url, callback) => {
	axios.get(url, {responseType: 'arraybuffer'}).then((res) => {
		callback(null, iconv.decode(res.data, 'sjis'));
	}).catch((error) => callback(error));
};

const pageUrls = new Set();

const normalizeMeaning = (input) => {
	let meaning = input;
	if (meaning.includes('とは、')) {
		meaning = meaning.replace(/^.+?とは、/, '');
	} else if (meaning.includes('は、')) {
		meaning = meaning.replace(/^.+?は、/, '');
	} else if (meaning.includes('とは')) {
		meaning = meaning.replace(/^.+?とは/, '');
	} else if (meaning.includes('、')) {
		meaning = meaning.replace(/^.+?、/, '');
	} else {
		meaning = meaning.replace(/^.+?は/, '');
	}
	meaning = meaning.replace(/^== (.+?) ==$/g, '$1');
	meaning = meaning.replace(/\[.+?\]/g, '');
	meaning = meaning.replace(/\(.+?\)/g, '');
	meaning = meaning.replace(/（.+?）/g, '');
	meaning = meaning.replace(/【.+?】/g, '');
	meaning = meaning.replace(/。.*$/, '');
	meaning = meaning.replace(/^.+? -/, '');
	meaning = meaning.replace(/であり、.+$/, '');
	meaning = meaning.replace(/で、.+$/, '');
	meaning = meaning.replace(/(のこと|をいう|である)+$/, '');
	return meaning.trim();
};

(async () => {
	const eword = await promisify(fs.readFile)('eword.txt');
	const existingWords = new Set(eword.toString().split('\n').map((line) => line.split('\t')[0]));

	const writer = fs.createWriteStream('eword.txt', {flags: 'a'});

	for (const page of pages) {
		const url = URL.resolve('http://e-words.jp/', page);

		console.log(`Scraping ${page}...`);
		await new Promise((resolve) => setTimeout(resolve, 3000));

		const {data: {entries}} = await scrape(url, {
			entries: {
				listItem: 'li',
				data: {
					link: {
						selector: 'a',
						attr: 'href',
						convert: (link) => URL.resolve(url, link),
					},
				},
			},
		});

		for (const {link} of entries) {
			const parsedLink = URL.parse(link);
			parsedLink.hash = '';
			pageUrls.add(URL.format(parsedLink));
		}
	}

	await promisify(fs.writeFile)('temp.json', JSON.stringify([...pageUrls]));

	for (const url of pageUrls) {
		const wordMatch = url.match(/\/([^\/]+?)\.html$/);

		if (!wordMatch) {
			continue;
		}

		const rawWord = decodeURIComponent(wordMatch[1]);

		if (existingWords.has(rawWord)) {
			continue;
		}

		console.log(`Scraping ${url}...`);
		await new Promise((resolve) => setTimeout(resolve, 3000));

		const {data: {ruby, alias, word, text, description}} = await scrape(url, {
			ruby: '#pron',
			alias: '#h1word > .alias',
			word: '#word',
			text: '#Summary',
			description: 'article > p',
		});

		const meaning = normalizeMeaning(text || description);

		if (meaning.length === 0) {
			continue;
		}

		let normalizedRuby = '';

		if (word.match(/^[\u3040-\u309F\u30A0-\u30FF・=]+$/)) {
			writer.write([rawWord, hiraganize(word.replace(/[・=]/g, '')), meaning].join('\t') + '\n');
		} else {
			const rubies = new Set([...ruby.split('/'), ...alias.split(/[【】\/]/)].map((r) => hiraganize(r.trim().replace(/[・=]/g, ''))));
			for (const rubyEntry of rubies) {
				if (rubyEntry.length > 0 && rubyEntry.match(/^[\u3040-\u309F\u30A0-\u30FF・=]+$/)) {
					writer.write([rawWord, rubyEntry, meaning].join('\t') + '\n');
				}
			}
		}
	}
})();