const scrape = require('scrape-it');
const URL = require('url');
const fs = require('fs');
const {hiraganize} = require('japanese');
const {promisify} = require('util');
const {flatten} = require('lodash');

process.on('unhandledRejection', (error) => {
	throw error;
});

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
	const existingWords = new Set(require('./existingWords.json'));

	const writer = fs.createWriteStream('binary.txt', {flags: 'a'});

	const rootUrl = 'http://www.sophia-it.com/';

	/*
	console.log(`Scraping ${rootUrl}...`);
	await new Promise((resolve) => setTimeout(resolve, 3000));

	const {data: {pages}} = await scrape(rootUrl, {
		pages: {
			listItem: '.sakuin1 > a, .sakuin2 > a',
			data: {
				link: {
					attr: 'href',
				},
			},
		},
	});

	for (const page of pages) {
		console.log(`Scraping ${page.link}...`);
		await new Promise((resolve) => setTimeout(resolve, 3000));

		const {data: {entries}} = await scrape(page.link, {
			entries: {
				listItem: '.links > a',
				data: {
					link: {
						attr: 'href',
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
	*/
	const pageUrls = new Set(require('./temp.json'));

	for (const url of pageUrls) {
		const components = url.split('/');
		const rawWord = decodeURIComponent(components[components.length - 1]);

		if (existingWords.has(rawWord)) {
			continue;
		}

		console.log(`Scraping ${url}...`);
		await new Promise((resolve) => setTimeout(resolve, 3000));

		const {data: {title, description}} = await scrape(url, {
			title: 'h2.sub',
			description: 'tr:first-child > td.txts',
		});

		existingWords.add(rawWord);
		await promisify(fs.writeFile)('existingWords.json', JSON.stringify([...existingWords]));

		if (title !== rawWord && existingWords.has(title)) {
			continue;
		}
		existingWords.add(title);
		await promisify(fs.writeFile)('existingWords.json', JSON.stringify([...existingWords]));

		const lines = description.split('\n');

		const rubies = [
			[title],
			...lines.map((line) => {
				const matches = line.match(/^(読み方|別名)：(.+)$/);
				return matches && matches[2].split(/[，,]/);
			}).filter((line) => line),
		];

		const validRubies = flatten(rubies).filter((line) => line.match(/^[\u3040-\u309F\u30A0-\u30FF・=\s]+$/));

		const meaningLine = lines.find((line) => line.includes('とは、'));

		if (!meaningLine) {
			continue;
		}

		const meaning = normalizeMeaning(meaningLine);

		console.log({validRubies, meaning});

		if (meaning.length === 0) {
			continue;
		}

		for (const ruby of validRubies) {
			writer.write([title, hiraganize(ruby.trim().replace(/[・=\s]/g, '')), meaning].join('\t') + '\n');
		}
	}
})();