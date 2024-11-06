import puppeteer, { ElementHandle } from 'puppeteer';
import 'dotenv/config';
import qs from 'querystring';
import fs from 'fs/promises';

const prefectures = [
	'北海道', '青森県', '岩手県', '秋田県',
	'宮城県', '山形県', '福島県', '東京都',
	'神奈川県', '千葉県', '埼玉県', '茨城県',
	'栃木県', '群馬県', '山梨県', '長野県',
	'石川県', '新潟県', '富山県', '福井県',
	'愛知県', '静岡県', '岐阜県', '三重県',
	'大阪府', '兵庫県', '京都府', '滋賀県',
	'奈良県', '和歌山県', '愛媛県', '香川県',
	'高知県', '徳島県', '岡山県', '広島県',
	'島根県', '鳥取県', '山口県', '福岡県',
	'佐賀県', '長崎県', '熊本県', '大分県',
	'宮崎県', '鹿児島県', '沖縄県',
];

const topPrefectures = ['富山県', '福井県', '香川県', '大分県', '石川県', '滋賀県', '鳥取県', '島根県', '山口県', '愛媛県'];

const NEWMONIC_EMAIL = process.env.NEWMONIC_EMAIL;
const NEWMONIC_PASSWORD = process.env.NEWMONIC_PASSWORD;

if (!NEWMONIC_EMAIL || !NEWMONIC_PASSWORD) {
	throw new Error('NEWMONIC_EMAIL or NEWMONIC_PASSWORD is not set');
}

interface CitySymbol {
	prefectureName: string;
	cityName: string;
	cityWikipediaName: string;
	reason: string;
	date: string;
	notes: string;
	files: string[];
}

interface CityInfo {
	pref: string,
	city: string,
	citykana: string,
}

const getWikimediaImageUrl = (fileName: string) => {
	if (fileName.startsWith('http')) {
		return fileName;
	}
	return `https://commons.wikimedia.org/wiki/Special:FilePath/${qs.escape(fileName)}?width=400`;
};

const getCitySymbols = async (prefName: string) => {
	const title = `${prefName}の${prefName === '東京都' ? '区' : ''}市町村章一覧`;
	console.log(`Getting wikipedia ${title}...`);
	const url = `https://ja.wikipedia.org/w/api.php?${qs.encode({
		format: 'json',
		action: 'query',
		prop: 'revisions',
		rvprop: 'content',
		titles: title,
	})}`;

	await new Promise((resolve) => setTimeout(resolve, 1000));
	const response = await fetch(url);
	const json = await response.json();

	const pages = json?.query?.pages;
	const content = pages?.[Object.keys(pages)[0]]?.revisions?.[0]?.['*'];
	if (!content) {
		throw new Error('Failed to get wikipedia source');
	}

	const lines = content.split('\n');
	const citySymbols: CitySymbol[] = [];

	for (const line of lines) {
		if (line.startsWith('=') && line.includes('廃止された')) {
			break;
		}

		const normalizedLine = line
			.replaceAll(/<ref[^/>]*>.*?<\/ref>/g, '')
			.replaceAll(/<ref[^>]*\/>/g, '')
			.replaceAll(/\[\[\s*(?:File|Image|ファイル):[^\]]+\]\]/gi, '')
			.replaceAll(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
			.replaceAll(/\[\[([^\]]+)\]\]/g, '$1')
			.replaceAll(/^\|/g, '')
			.replaceAll(/\{\{.*?\}\}/g, '')
			.trim();
		const files = line.matchAll(/\[\[\s*(?:File|Image|ファイル):([^\]|]+)(?:\|[^\]]+)?\]\]/gi);

		if (files.length === 0) {
			continue;
		}

		if (!normalizedLine.includes('||')) {
			continue;
		}

		const columns = normalizedLine.split('||');
		if (columns.length < 5) {
			continue;
		}

		const [cityName, , reason, date, notes] = columns.slice(-5);
		const cityWikipediaName = line.match(new RegExp(`\\[\\[((?:[^|\\]]+\\|)?${cityName})\\]\\]`))?.[1] || '';

		citySymbols.push({
			prefectureName: prefName,
			cityName: cityName.trim().replaceAll('|', ''),
			cityWikipediaName: cityWikipediaName.split('|')[0].trim(),
			reason: reason.trim(),
			date: date.trim(),
			notes: notes.trim().replaceAll(/<br \/>/g, '\n'),
			files: [...files].map(([, file]) => file),
		});
	}

	console.log(`Got ${citySymbols.length} city symbols from ${prefName}`);

	return citySymbols;
};

const getCitySymbolsAll = async () => {
	if (await fs.stat('city-symbols.json').catch(() => null)) {
		return JSON.parse(await fs.readFile('city-symbols.json', 'utf-8'));
	}

	const citySymbolsAll: CitySymbol[] = [];
	for (const prefName of prefectures) {
		const citySymbols = await getCitySymbols(prefName);
		citySymbolsAll.push(...citySymbols);
	}

	await fs.writeFile('city-symbols.json', JSON.stringify(citySymbolsAll, null, 2));

	return citySymbolsAll;
};

const getTopCitySymbolsAll = async () => {
	if (await fs.stat('city-symbols-top.json').catch(() => null)) {
		return JSON.parse(await fs.readFile('city-symbols-top.json', 'utf-8'));
	}

	const citySymbolsAll: CitySymbol[] = [];
	for (const prefName of topPrefectures) {
		const citySymbols = await getCitySymbols(prefName);
		citySymbolsAll.push(...citySymbols);
	}

	await fs.writeFile('city-symbols-top.json', JSON.stringify(citySymbolsAll, null, 2));

	return citySymbolsAll;
};

const getExtension = (mimeType: string) => {
	switch (mimeType) {
		case 'image/jpeg':
			return 'jpg';
		case 'image/png':
			return 'png';
		case 'image/gif':
			return 'gif';
		case 'image/webp':
			return 'webp';
		default:
			throw new Error(`Unknown mime type: ${mimeType}`);
	}
};

const mode = 'top';
const citySymbols = mode === 'top' ? await getTopCitySymbolsAll() : await getCitySymbolsAll();
const processedCitiesJsonFile = mode === 'top' ? 'city-symbols-top-processed-cities.json' : 'city-symbols-processed-cities.json';

for (const citySymbol of citySymbols) {
	const fullCityName = `${citySymbol.prefectureName}${citySymbol.cityName}`;

	if (await fs.stat(`city-symbols/${fullCityName}.png`).catch(() => null)) {
		continue;
	}

	console.log(`Downloading ${fullCityName}...`);

	const imageUrl = getWikimediaImageUrl(citySymbol.files[0]);
	await new Promise((resolve) => setTimeout(resolve, 200));
	const response = await fetch(imageUrl);
	const data = await response.arrayBuffer();
	const ext = getExtension(response.headers.get('content-type') || '');
	await fs.writeFile(`city-symbols/${fullCityName}.${ext}`, Buffer.from(data));
}

console.log('Fetching cities...');

await new Promise((resolve) => setTimeout(resolve, 5000));
const cityInfosRes = await fetch('https://code4fukui.github.io/localgovjp/localgovjp.json');
const cityInfos: CityInfo[] = await cityInfosRes.json();

const citySymbolImages = await fs.readdir('city-symbols');

const browser = await puppeteer.launch({headless: true});
const page = await browser.newPage();

await page.goto('https://newmonic.baton8.com/login');

await page.setViewport({ width: 1080, height: 1024 });

const [emailInput, passwordInput] = await Promise.all([
	page.waitForSelector('input[name="email"]'),
	page.waitForSelector('input[name="password"]'),
]);

await emailInput.type(NEWMONIC_EMAIL);
await passwordInput.type(NEWMONIC_PASSWORD);

await Promise.all([
	page.waitForNavigation(),
	page.click('button[type="submit"]'),
]);

await page.goto('https://newmonic.baton8.com/deck/0192bdf8-eacd-7086-af55-4f5916bcec12', {
	waitUntil: 'networkidle2',
});

const isDryRun = false;
const processedCities = new Set<string>();

try {
	const processedCitiesJson = await fs.readFile(processedCitiesJsonFile, 'utf-8');
	const processedCityNames = JSON.parse(processedCitiesJson);
	for (const cityName of processedCityNames) {
		processedCities.add(cityName);
	}
} catch (error) {
	console.error(error);
}

for (const citySymbol of citySymbols) {
	const fullCityName = `${citySymbol.prefectureName}${citySymbol.cityName}`;

	if (processedCities.has(fullCityName)) {
		console.log(`Skipping ${fullCityName}`);
		continue;
	}

	const cityInfo = cityInfos.find((cityInfo) => cityInfo.city === citySymbol.cityName && cityInfo.pref === citySymbol.prefectureName);

	if (!cityInfo) {
		console.error(`City info not found: ${fullCityName}`);
		continue;
	}

	const citySymbolImage = citySymbolImages.find((image) => image.startsWith(fullCityName));
	
	if (!citySymbolImage) {
		console.error(`City symbol image not found: ${fullCityName}`);
		continue;
	}

	if (isDryRun) {
		continue;
	}

	console.log(`Creating ${fullCityName}...`);

	let problemHeading: ElementHandle | null = null;
	let answerHeading: ElementHandle | null = null;
	let explanationHeading: ElementHandle | null = null;
	let retryCount = 0;
	while (retryCount < 3) {
		try {
			const createButton = await page.waitForSelector('button::-p-text(新しいクイズを追加)');

			await createButton.click();

			[problemHeading, answerHeading, explanationHeading] = await Promise.all([
				page.waitForSelector('h2::-p-text(問題)'),
				page.waitForSelector('h2::-p-text(解答)'),
				page.waitForSelector('h2::-p-text(解説)'),
			]);

			break;
		} catch (error) {
			console.error(error);
			retryCount++;
		}
	}

	await page.screenshot({ path: 'screenshot1.png' });

	const problemHeaderNextSibling = await problemHeading.evaluateHandle((heading) => heading.nextElementSibling);
	const problemAddImageButton = await problemHeaderNextSibling.$('button::-p-text(画像を追加)');

	const [fileChooser] = await Promise.all([
		page.waitForFileChooser(),
		problemAddImageButton.click(),
	]);

	await fileChooser.accept([`city-symbols/${citySymbolImage}`]);

	const answerHeadingNextSibling = await answerHeading.evaluateHandle((heading) => heading.nextElementSibling);
	const answerTextArea = await answerHeadingNextSibling.$('textarea');

	await answerTextArea.type(`${citySymbol.prefectureName} ${citySymbol.cityName} (${cityInfo.citykana})`);

	const explanationHeadingNextSibling = await explanationHeading.evaluateHandle((heading) => heading.nextElementSibling);
	const explanationTextArea = await explanationHeadingNextSibling.$('textarea');

	await explanationTextArea.type(citySymbol.reason);

	await page.waitForSelector('h2::-p-text(問題) + div img');

	await page.screenshot({ path: 'screenshot2.png' });

	await Promise.all([
		page.click('button::-p-text(作成する)'),
		page.waitForSelector('button::-p-text(作成する)', { hidden: true }),
	]);

	await page.screenshot({ path: 'screenshot3.png' });

	processedCities.add(fullCityName);
	await fs.writeFile('city-symbols-processed-cities.json', JSON.stringify(Array.from(processedCities), null, 2));

	await new Promise((resolve) => setTimeout(resolve, 2000));
}

await browser.close();