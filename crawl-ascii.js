const scrape = require('scrape-it');
const URL = require('url');
const fs = require('fs');
const axios = require('axios');
const {hiraganize} = require('japanese');
const {promisify} = require('util');
const {get, chunk} = require('lodash');
const cheerio = require('cheerio');

process.on('unhandledRejection', (error) => {
	throw error;
});

const pageUrls = new Set();

const normalizeMeaning = (input) => {
	let meaning = input;
	meaning = meaning.replace(/\n/g, '');
	meaning = meaning.replace(/\[.+?\]/g, '');
	meaning = meaning.replace(/\(.+?\)/g, '');
	meaning = meaning.replace(/（.+?）/g, '');
	meaning = meaning.replace(/【.+?】/g, '');
	meaning = meaning.replace(/。.*$/, '');
	meaning = meaning.replace(/であり、.+$/, '');
	meaning = meaning.replace(/(のこと|をいう|である)+$/, '');
	return meaning.trim();
};

(async () => {
	const url = 'http://yougo.ascii.jp/api.php';

	const ascii = await promisify(fs.readFile)('ascii.txt');
	const existingWords = new Set(ascii.toString().split('\n').map((line) => line.split('\t')[0]));

	const writer = fs.createWriteStream('ascii.txt', {flags: 'a'});

	const titles = new Set();

	let apfrom = '納品書';
	do {
		console.log(`Querying ${url}... (apfrom=${apfrom})`);
		await new Promise((resolve) => setTimeout(resolve, 3000));

		const {data} = await axios.get(url, {
			params: {
				action: 'query',
				list: 'allpages',
				aplimit: 500,
				apfrom,
				apfilterredir: 'nonredirects',
				format: 'json',
				formatversion: 2,
			},
		});

		const pages = get(data, ['query', 'allpages']);
		apfrom = get(data, ['query-continue', 'allpages', 'apfrom']);

		for (const {title} of pages) {
			titles.add(title);
		}
	} while (apfrom);

	for (const title of titles) {
		if (existingWords.has(title)) {
			continue;
		}

		console.log(`Querying ${url}... (page=${title})`);
		await new Promise((resolve) => setTimeout(resolve, 3000));

		const {data} = await axios.get(url, {
			params: {
				action: 'parse',
				page: title,
				prop: 'text',
				format: 'json',
				formatversion: 2,
			},
		});

		const html = get(data, ['parse', 'text', '*']);

		if (!html) {
			continue;
		}

		const $ = cheerio.load(html);
		const headline = $('p').first().text().trim();
		const description = $('p').eq(1).text().trim();

		const headruby = headline.split(/[【】]/)[0];
		const meaning = normalizeMeaning(description);

		console.log({title, headruby, meaning});

		if (meaning.length === 0) {
			continue;
		}

		const rubies = new Set([title, ...headruby.split('、')].map((ruby) => hiraganize(ruby.trim().replace(/[・=\s（）\(\)\/]/g, ''))));

		for (const ruby of rubies) {
			if (ruby.match(/^[\u3040-\u309F\u30A0-\u30FF]+$/)) {
				writer.write([title, ruby, meaning].join('\t') + '\n');
			}
		}

		existingWords.add(title);
	}
})();