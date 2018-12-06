const cheerioReq = require('cheerio-req');
const axios = require('axios');
const scrape = require('scrape-it');
const URL = require('url');
const iconv = require('iconv-lite');
const fs = require('fs');
const {hiraganize} = require('japanese');
const {promisify} = require('util');

process.on('unhandledRejection', (error) => {
	throw error;
});

cheerioReq.request = (url, callback) => {
	axios.get(url, {responseType: 'arraybuffer'}).then((res) => {
		callback(null, iconv.decode(res.data, 'EUC-JP'));
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
	}
	meaning = meaning.replace(/^== (.+?) ==$/g, '$1');
	meaning = meaning.replace(/\[.+?\]/g, '');
	meaning = meaning.replace(/\(.+?\)/g, '');
	meaning = meaning.replace(/（.+?）/g, '');
	meaning = meaning.replace(/【.+?】/g, '');
	meaning = meaning.replace(/。.*$/, '');
	meaning = meaning.replace(/^.+? -/, '');
	meaning = meaning.replace(/であり、.+$/, '');
	meaning = meaning.replace(/(のこと|をいう|である)+$/, '');
	return meaning.trim();
};

(async () => {
	const fideli = await promisify(fs.readFile)('fideli.txt');
	const existingWords = new Set(require('./existingWords2.json'));

	const writer = fs.createWriteStream('fideli.txt', {flags: 'a'});

	const rootUrl = 'http://dic-it.fideli.com/';

	/*
	console.log(`Scraping ${rootUrl}...`);
	await new Promise((resolve) => setTimeout(resolve, 3000));

	const {data: {pages}} = await scrape(rootUrl, {
		pages: {
			listItem: '#search2 a',
			data: {
				link: {
					attr: 'href',
				},
			},
		},
	});

	for (const page of pages) {
		const url = URL.resolve(rootUrl, page.link);

		console.log(`Scraping ${url}...`);
		await new Promise((resolve) => setTimeout(resolve, 3000));

		const {data: {entries}} = await scrape(url, {
			entries: {
				listItem: '#main li',
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
			pageUrls.add(link);
		}
	}

	await promisify(fs.writeFile)('temp2.json', JSON.stringify([...pageUrls]));
	*/
	const pageUrls = new Set(require('./temp2.json'));

	for (const url of pageUrls) {
		const components = url.split('/');
		const id = components[components.length - 2];

		if (existingWords.has(id)) {
			continue;
		}

		console.log(`Scraping ${url}...`);
		await new Promise((resolve) => setTimeout(resolve, 3000));

		const {data: {title, headline, paragraphs}} = await scrape(url, {
			title: '#pickup h4:first-child',
			headline: '#pickup h4:first-child + div',
			paragraphs: {
				listItem: '#pickup > p',
			},
		});

		existingWords.add(id);
		await promisify(fs.writeFile)('existingWords2.json', JSON.stringify([...existingWords]));

		console.log(paragraphs);
		const meaning = normalizeMeaning(paragraphs.find((p) => p.match && !p.match(/[【】]/)) || '');

		if (meaning.length === 0) {
			continue;
		}

		const headTokens = headline.split(/[【】]/);
		const rubyIndex = headTokens.findIndex((token) => token === '読み方');
		const headRubies = rubyIndex === undefined ? [] : (headTokens[rubyIndex + 1] || '').trim().split('、');
		const rubies = new Set([title, ...headRubies].map((ruby) => hiraganize(ruby.trim().replace(/[・=\s（）\(\)\/]/g, ''))));

		console.log({meaning, rubies, headline});

		for (const ruby of rubies) {
			if (ruby.match(/^[\u3040-\u309F\u30A0-\u30FF]+$/)) {
				writer.write([title, ruby, meaning, id].join('\t') + '\n');
			}
		}
	}
})();