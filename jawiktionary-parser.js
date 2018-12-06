const fs = require('fs');
const Parser = require('xml-stream');
const {get, last, chunk} = require('lodash');

const parser = new Parser(fs.createReadStream('jawiktionary-20180701-pages-articles.xml'));
const writer = fs.createWriteStream('wiktionary.txt');

parser.on('endElement: page', (page) => {
	const title = page.title || '';
	const text = get(page, ['revision', 'text', '$text'], '').replace(/<!--.+?-->/g, '');

	if (!text.match('Category:{{jpn}}') && !text.match('Category:日本語')) {
		return;
	}

	if (title.match(/^[\p{Script=Hiragana}\p{Script=Katakana}ー]+$/u)) {
		writer.write(`${title} ${title}\n`);
		return;
	}

	const sections = chunk(text.replace(/\s+/g, '\n').split(/^==([^=]+)==$/m).slice(1), 2);
	const jaSection = sections.find(([head]) => ['日本語', '{{jpn}}', '{{ja}}'].includes(head.trim()));

	if (jaSection) {
		const [, jaText] = jaSection;

		const subsections = chunk(jaText.split(/^=+([^=]+)=+$/m).slice(1), 2);
		const rubySection = subsections.find(([head]) => ['読み', '{{pron}}', '{{pron|ja}}', '{{pron|jpn}}'].includes(head.trim()));

		if (rubySection) {
			const matches = rubySection[1].match(/\[\[([\p{Script=Hiragana}]+)\]\]/u);
			if (matches !== null) {
				writer.write(`${title} ${matches[1]}\n`);
				return;
			}
		}

		const nounSection = subsections.find(([head]) => ['名詞', '{{noun}}'].includes(head.trim()));

		if (nounSection) {
			const matches = nounSection[1].replace(/([\[\]':]|呉音|漢音|唐音)/g, '').match(/[\(（【]([\p{Script=Hiragana}\p{Script=Katakana}ー\s\/／、]+)[\)）】]/u);
			if (matches !== null) {
				writer.write(`${title} ${matches[1].replace(/\s/g, '').split(/[、\/／]/)[0]}\n`);
				return;
			}
		}

		{
			const matches = jaText.replace(/([\[\]':]|呉音|漢音|唐音)/g, '').match(/[\(（【]([\p{Script=Hiragana}\p{Script=Katakana}ー\s\/、]+)[\)）】]/u);
			if (matches !== null) {
				writer.write(`${title} ${matches[1].replace(/\s/g, '').split(/[、\/]/)[0]}\n`);
				return;
			}
		}
	}

	const matches = text.match(/{{DEFAULTSORT:(.+?)}}/);
	if (matches) {
		const defaultSort = matches[1];
		const rubies = defaultSort.match(/[\p{Script=Hiragana}\p{Script=Katakana}ー]+/gu);

		if (rubies) {
			writer.write(`${title} ${last(rubies)}\n`);
			return;
		}
	}
});

parser.on('end', () => {
	writer.end();
});
