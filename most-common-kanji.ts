import scrapeIt from 'scrape-it';
import download from 'download';
import fs from 'fs-extra';
import {inspect} from 'util';
import { range } from 'lodash';

const idcArguments = new Map([
	['⿰', 2],
	['⿱', 2],
	['⿲', 3],
	['⿳', 3],
	['⿴', 2],
	['⿵', 2],
	['⿶', 2],
	['⿷', 2],
	['⿸', 2],
	['⿹', 2],
	['⿺', 2],
	['⿻', 2],
]);

class Counter<K> {
	#values = new Map<K, number>();
	increment(key: K) {
		if (!this.#values.has(key)) {
			this.#values.set(key, 0);
		}
		this.#values.set(key, this.#values.get(key) + 1);
	}
	top(n: number) {
		return Array.from(this.#values).sort(([, a], [, b]) => b - a).slice(0, n);
	}
}

const normalizeChar = (char: string) => {
	if (char === '辶') {
		return '辶\u{E0101}';
	}
	return char;
};

const splitIds = (ids: string) => {
	let remnant = Array.from(ids);
	const idcs = [];

	while (remnant.length > 0) {
		if (remnant[0] === '&') {
			const index = remnant.indexOf(';');
			idcs.push(remnant.slice(0, index + 1).join(''));
			remnant = remnant.slice(index + 1);
		} else {
			idcs.push(remnant[0]);
			remnant.shift();
		}
	}

	return idcs;
};

interface Component {
	type: string,
	char: string | null,
	children: Component[],
}

const parseIds = (ids: string) => {
	const idcs = splitIds(ids);

	const getSequence = () => {
		const idc = idcs.shift();
		if (!idc) {
			throw new Error(`ParseError: ${ids}`);
		}

		if (idcArguments.has(idc)) {
			const argumentCounts = idcArguments.get(idc);
			const children: Component[] = [];
			for (const i of Array(argumentCounts).keys()) {
				children.push(getSequence());
			}
			return {
				type: idc,
				char: null,
				children,
			} as Component;
		}

		return {
			type: '　',
			char: normalizeChar(idc),
			children: [],
		} as Component;
	}

	const sequence = getSequence();
	if (idcs.length > 0) {
		throw new Error(`ParseError: ${ids}`);
	}

	return sequence;
};

const traverseComponentChars = (component: Component) => {
	const chars: string[] = [];
	if (component.char !== null) {
		chars.push(component.char);
	}

	for (const child of component.children) {
		chars.push(...traverseComponentChars(child));
	}

	return chars;
}

const encodeIds = (component: Component) => {
	if (component.type === '　') {
		return component.char;
	}
	return `${component.type}${component.children.map(encodeIds).join('')}`;
};

(async () => {
	const joyoCharsData = await download('https://github.com/tsg-ut/slackbot/raw/master/wadokaichin/data/JoyoKanjis.txt');
	const joyoChars = joyoCharsData.toString().split('\n').filter((c) => c);

	const dirPath = `${__dirname}/files`;
	
	/*
	const {data} = await scrapeIt<{files: string[]}>('http://git.chise.org/gitweb/?p=chise/ids.git;a=tree', {
		files: {
			listItem: 'td.list .list',
		}
	});
	const idsFiles = data.files.filter((file) => file.startsWith('IDS-') && file.endsWith('.txt'));
	*/

	const idsFiles = await fs.readdir(dirPath);

	const characterIds = new Map<string, Component>();
	const characterIdsStrings = new Set<string>();
	const aliases = new Map<string, string>();
	for (const file of idsFiles) {
		const filePath = `${__dirname}/files/${file}`;

		await fs.ensureDir(dirPath);
		if (!(await fs.pathExists(filePath))) {
			console.log(`Downwloading ${file}...`);
			await download(`http://git.chise.org/gitweb/?p=chise/ids.git;a=blob_plain;f=${file};hb=HEAD`, dirPath);
		}

		const data = await fs.readFile(filePath);
		for (const line of data.toString().split('\n')) {
			if (line.startsWith(';')) {
				continue;
			}

			const [codepoint, char, ids, additionalInfo] = line.split('\t');
			let sequenceString = ids;
			if (additionalInfo) {
				sequenceString = additionalInfo.split('=')[1];
			}

			if (!ids) {
				characterIds.set(char, {type: '　', char, children: []} as Component);
				continue;
			}

			try {
				const sequence = parseIds(sequenceString)
				if (sequence.type === '　' && sequence.char !== null && sequence.char !== char) {
					aliases.set(char, sequence.char);
				} else {
					sequence.char = char;
					characterIds.set(char, sequence);
				}
			} catch (error) {
			}
		}
	}

	const overloadData = await fs.readFile(`${__dirname}/overload.txt`);
	for (const overloadLine of overloadData.toString().split(/\r?\n/)) {
		if (!overloadLine) {
			continue;
		}

		const [char, ids] = overloadLine.split('\t');

		const sequence = parseIds(ids)
		if (sequence.type === '　' && sequence.char !== null && sequence.char !== char) {
			aliases.set(char, sequence.char);
		}
	}

	console.log(aliases);

	const traverseFill = (component: Component) => {
		for (const [i, child] of component.children.entries()) {
			if (child.type === '　' && child.char !== null) {
				while (aliases.has(child.char)) {
					child.char = aliases.get(child.char)!;
				}
			} else {
				traverseFill(child);
			}
		}
	};

	for (const component of characterIds.values()) {
		traverseFill(component);
		characterIdsStrings.add(encodeIds(component));
	}

	{
		const typesCounter = new Counter<string>();
		const leftCounter = new Counter<string>();
		const rightCounter = new Counter<string>();
		for (const char of joyoChars) {
			const composition = characterIds.get(char);
			if (!composition) {
				continue;
			}
			typesCounter.increment(composition.type);

			if (composition.type === '⿰') {
				const [left, right] = composition.children.map(encodeIds);
				leftCounter.increment(left);
				rightCounter.increment(right);
			}
		}
		console.log(typesCounter.top(100));
		console.log(leftCounter.top(20));
		console.log(rightCounter.top(20));

		const leftParts = leftCounter.top(1000);
		const rightParts = rightCounter.top(1000);

		let maxScore = 0;
		let maxScoreString = '';
		for (const [leftPart, leftCount] of leftParts) {
			for (const [rightPart, rightCount] of rightParts) {
				const ids = `⿰${leftPart}${rightPart}`;
				const score = Math.log(leftCount) + Math.log(rightCount);
				if (!characterIdsStrings.has(ids) && maxScore < score) {
					maxScore = score;
					maxScoreString = ids;
				}
			}
		}
		console.log({maxScoreString, maxScore});

		const topLeftParts = new Set(leftCounter.top(30).map(([part]) => part));
		const normalizedRightCounter = new Counter<string>();
		for (const char of joyoChars) {
			const composition = characterIds.get(char);
			if (!composition) {
				continue;
			}

			if (composition.type === '⿰') {
				const [left, right] = composition.children.map(encodeIds);
				if (topLeftParts.has(left)) {
					normalizedRightCounter.increment(right);
				}
			}
		}

		console.log(normalizedRightCounter.top(20));

		const normalizedRightParts = normalizedRightCounter.top(1000);

		for (const weight of range(1, 30)) {
			maxScore = 0;
			maxScoreString = '';
			for (const [leftPart, leftCount] of leftParts) {
				for (const [rightPart, rightCount] of normalizedRightParts) {
					const ids = `⿰${leftPart}${rightPart}`;
					const score = Math.log(leftCount) + Math.log(rightCount) * weight / 5;
					if (!characterIdsStrings.has(ids) && maxScore < score) {
						maxScore = score;
						maxScoreString = ids;
					}
				}
			}
			console.log({weight, maxScoreString, maxScore});
		}
	}

	{
		const typesCounter = new Counter<string>();
		const leftCounter = new Counter<string>();
		const rightCounter = new Counter<string>();
		for (const cp of range(0x4E00, 0x9FFF)) {
			const char = String.fromCodePoint(cp);
			const composition = characterIds.get(char);
			if (!composition) {
				continue;
			}
			typesCounter.increment(composition.type);

			if (composition.type === '⿰') {
				const [left, right] = composition.children.map(encodeIds);
				leftCounter.increment(left);
				rightCounter.increment(right);
			}
		}
		console.log(typesCounter.top(100));
		console.log(leftCounter.top(20));
		console.log(rightCounter.top(20));

		console.log(leftCounter.top(20).map(([ids, score]) => `|${ids}|${score}|`).join('\n'));
		console.log(rightCounter.top(20).map(([ids, score]) => `|${ids}|${score}|`).join('\n'));

		const leftParts = leftCounter.top(1000);
		const rightParts = rightCounter.top(1000);

		let maxScore = 0;
		let maxScoreString = '';
		for (const [leftPart, leftCount] of leftParts) {
			for (const [rightPart, rightCount] of rightParts) {
				const ids = `⿰${leftPart}${rightPart}`;
				const score = Math.log(leftCount) * Math.log(rightCount);
				if (!characterIdsStrings.has(ids) && maxScore < score) {
					maxScore = score;
					maxScoreString = ids;
				}
			}
		}
		console.log({maxScoreString, maxScore});

		const topLeftParts = new Set(leftCounter.top(30).map(([part]) => part));
		const normalizedRightCounter = new Counter<string>();
		for (const cp of range(0x4E00, 0x9FFF)) {
			const char = String.fromCodePoint(cp);
			const composition = characterIds.get(char);
			if (!composition) {
				continue;
			}

			if (composition.type === '⿰') {
				const [left, right] = composition.children.map(encodeIds);
				if (topLeftParts.has(left)) {
					normalizedRightCounter.increment(right);
				}
			}
		}

		console.log(normalizedRightCounter.top(20).map(([ids, score]) => `|${ids}|${score}|`).join('\n'));

		const normalizedRightParts = normalizedRightCounter.top(1000);
		const scoreRanking: [string, number][] = [];

		for (const [leftPart, leftCount] of leftParts) {
			for (const [rightPart, rightCount] of normalizedRightParts) {
				const ids = `⿰${leftPart}${rightPart}`;
				const score = Math.log(leftCount) * Math.log(rightCount);
				if (!characterIdsStrings.has(ids)) {
					scoreRanking.push([ids, score]);
				}
			}
		}

		const topRanking = scoreRanking.sort(([, a], [, b]) => b - a).slice(0, 50);
		console.log(topRanking.map(([ids, score]) => `|${ids}|${score.toFixed(2)}|`).join('\n'));
	}
})()
