import 'dotenv/config';

import puppeteer, {ElementHandle} from 'puppeteer';
import qs from 'querystring';
import fs from 'fs/promises';

const countries = [
	'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'Colombia', 'Comoros', 'Cook Islands', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Cote d Ivoire', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'China', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Republic of the Congo', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Sao Tome and Principe', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

const japaneseOfficialCountryNames = [
	'アフガニスタン・イスラム共和国', 'アルバニア共和国', 'アルジェリア民主人民共和国', 'アンドラ公国', 'アンゴラ共和国', 'アンティグア・バーブーダ', 'アルゼンチン共和国', 'アルメニア共和国', 'オーストラリア', 'オーストリア共和国', 'アゼルバイジャン共和国', 'バハマ', 'バーレーン王国', 'バングラデシュ人民共和国', 'バルバドス', 'ベラルーシ共和国', 'ベルギー王国', 'ベリーズ', 'ベナン共和国', 'ブータン王国', 'ボリビア多民族国', 'ボスニア・ヘルツェゴビナ', 'ボツワナ共和国', 'ブラジル連邦共和国', 'ブルネイ・ダルサラーム国', 'ブルガリア共和国', 'ブルキナファソ', 'ブルンジ共和国', 'カンボジア王国', 'カメルーン共和国', 'カナダ', 'カーボベルデ共和国', '中央アフリカ共和国', 'チャド共和国', 'チリ共和国', 'コロンビア共和国', 'コモロ連合', 'クック諸島', 'コスタリカ共和国', 'クロアチア共和国', 'キューバ共和国', 'キプロス共和国', 'チェコ共和国', 'コートジボワール共和国', 'コンゴ民主共和国', 'デンマーク王国', 'ジブチ共和国', 'ドミニカ国', 'ドミニカ共和国', '東ティモール民主共和国', 'エクアドル共和国', 'エジプト・アラブ共和国', 'エルサルバドル共和国', '赤道ギニア共和国', 'エリトリア国', 'エストニア共和国', 'エスワティニ王国', 'エチオピア連邦民主共和国', 'フィジー共和国', 'フィンランド共和国', 'フランス共和国', 'ガボン共和国', 'ガンビア共和国', 'ジョージア', 'ドイツ連邦共和国', 'ガーナ共和国', 'ギリシャ共和国', 'グレナダ', 'グアテマラ共和国', 'ギニア共和国', 'ギニアビサウ共和国', 'ガイアナ共和国', 'ハイチ共和国', 'ホンジュラス共和国', 'ハンガリー', 'アイスランド', 'インド', 'インドネシア共和国', 'イラン・イスラム共和国', 'イラク共和国', 'アイルランド', 'イスラエル国', 'イタリア共和国', 'ジャマイカ', '日本', 'ヨルダン・ハシェミット王国', 'カザフスタン共和国', 'ケニア共和国', 'キリバス共和国', 'コソボ共和国', 'クウェート国', 'キルギス共和国', 'ラオス人民民主共和国', 'ラトビア共和国', 'レバノン共和国', 'レソト王国', 'リベリア共和国', 'リビア', 'リヒテンシュタイン公国', 'リトアニア共和国', 'ルクセンブルク大公国', 'マダガスカル共和国', 'マラウイ共和国', 'マレーシア', 'モルディブ共和国', 'マリ共和国', 'マルタ共和国', 'マーシャル諸島共和国', 'モーリタニア・イスラム共和国', 'モーリシャス共和国', 'メキシコ合衆国', 'ミクロネシア連邦', 'モルドバ共和国', 'モナコ公国', 'モンゴル国', 'モンテネグロ', 'モロッコ王国', 'モザンビーク共和国', 'ミャンマー連邦共和国', 'ナミビア共和国', 'ナウル共和国', 'ネパール', 'オランダ王国', 'ニュージーランド', 'ニカラグア共和国', 'ニジェール共和国', 'ナイジェリア連邦共和国', 'ニウエ', '北マケドニア共和国', 'ノルウェー王国', 'オマーン国', 'パキスタン・イスラム共和国', 'パラオ共和国', 'パナマ共和国', 'パプアニューギニア独立国', 'パラグアイ共和国', '中華人民共和国', 'ペルー共和国', 'フィリピン共和国', 'ポーランド共和国', 'ポルトガル共和国', 'カタール国', 'コンゴ共和国', 'ルーマニア', 'ロシア連邦', 'ルワンダ共和国', 'セントクリストファー・ネービス', 'セントルシア', 'セントビンセント及びグレナディーン諸島', 'サモア独立国', 'サンマリノ共和国', 'サウジアラビア王国', 'セネガル共和国', 'セルビア共和国', 'セーシェル共和国', 'シエラレオネ共和国', 'シンガポール共和国', 'スロバキア共和国', 'スロベニア共和国', 'ソロモン諸島', 'ソマリア連邦共和国', '南アフリカ共和国', '大韓民国', '南スーダン共和国', 'スペイン', 'スリランカ民主社会主義共和国', 'スーダン共和国', 'スリナム共和国', 'スウェーデン王国', 'スイス連邦', 'シリア・アラブ共和国', 'サントメ・プリンシペ民主共和国', 'タジキスタン共和国', 'タンザニア連合共和国', 'タイ王国', 'トーゴ共和国', 'トンガ王国', 'トリニダード・トバゴ共和国', 'チュニジア共和国', 'トルコ共和国', 'トルクメニスタン', 'ツバル', 'ウガンダ共和国', 'ウクライナ', 'アラブ首長国連邦', '英国(グレートブリテン及び北アイルランド連合王国)', '米国(アメリカ合衆国)', 'ウルグアイ東方共和国', 'ウズベキスタン共和国', 'バヌアツ共和国', 'バチカン', 'ベネズエラ・ボリバル共和国', 'ベトナム社会主義共和国', 'イエメン共和国', 'ザンビア共和国', 'ジンバブエ共和国',
];

const japaneseCountryNames = [
	'アフガニスタン', 'アルバニア', 'アルジェリア', 'アンドラ', 'アンゴラ', 'アンティグア・バーブーダ', 'アルゼンチン', 'アルメニア', 'オーストラリア', 'オーストリア', 'アゼルバイジャン', 'バハマ', 'バーレーン', 'バングラデシュ', 'バルバドス', 'ベラルーシ', 'ベルギー', 'ベリーズ', 'ベナン', 'ブータン', 'ボリビア', 'ボスニア・ヘルツェゴビナ', 'ボツワナ', 'ブラジル', 'ブルネイ', 'ブルガリア', 'ブルキナファソ', 'ブルンジ', 'カンボジア', 'カメルーン', 'カナダ', 'カーボベルデ', '中央アフリカ', 'チャド', 'チリ', 'コロンビア', 'コモロ', 'クック諸島', 'コスタリカ', 'クロアチア', 'キューバ', 'キプロス', 'チェコ', 'コートジボワール', 'コンゴ民主共和国', 'デンマーク', 'ジブチ', 'ドミニカ国', 'ドミニカ共和国', '東ティモール', 'エクアドル', 'エジプト', 'エルサルバドル', '赤道ギニア', 'エリトリア', 'エストニア', 'エスワティニ', 'エチオピア', 'フィジー', 'フィンランド', 'フランス', 'ガボン', 'ガンビア', 'ジョージア', 'ドイツ', 'ガーナ', 'ギリシャ', 'グレナダ', 'グアテマラ', 'ギニア', 'ギニアビサウ', 'ガイアナ', 'ハイチ', 'ホンジュラス', 'ハンガリー', 'アイスランド', 'インド', 'インドネシア', 'イラン', 'イラク', 'アイルランド', 'イスラエル', 'イタリア', 'ジャマイカ', '日本', 'ヨルダン', 'カザフスタン', 'ケニア', 'キリバス', 'コソボ', 'クウェート', 'キルギス', 'ラオス', 'ラトビア', 'レバノン', 'レソト', 'リベリア', 'リビア', 'リヒテンシュタイン', 'リトアニア', 'ルクセンブルク', 'マダガスカル', 'マラウイ', 'マレーシア', 'モルディブ', 'マリ', 'マルタ', 'マーシャル諸島', 'モーリタニア', 'モーリシャス', 'メキシコ', 'ミクロネシア', 'モルドバ', 'モナコ', 'モンゴル', 'モンテネグロ', 'モロッコ', 'モザンビーク', 'ミャンマー', 'ナミビア', 'ナウル', 'ネパール', 'オランダ', 'ニュージーランド', 'ニカラグア', 'ニジェール', 'ナイジェリア', 'ニウエ', '北マケドニア', 'ノルウェー', 'オマーン', 'パキスタン', 'パラオ', 'パナマ', 'パプアニューギニア', 'パラグアイ', '中国', 'ペルー', 'フィリピン', 'ポーランド', 'ポルトガル', 'カタール', 'コンゴ共和国', 'ルーマニア', 'ロシア', 'ルワンダ', 'セントクリストファー・ネービス', 'セントルシア', 'セントビンセント及びグレナディーン諸島', 'サモア', 'サンマリノ', 'サウジアラビア', 'セネガル', 'セルビア', 'セーシェル', 'シエラレオネ', 'シンガポール', 'スロバキア', 'スロベニア', 'ソロモン諸島', 'ソマリア', '南アフリカ', '韓国', '南スーダン', 'スペイン', 'スリランカ', 'スーダン', 'スリナム', 'スウェーデン', 'スイス', 'シリア', 'サントメ・プリンシペ', 'タジキスタン', 'タンザニア', 'タイ', 'トーゴ', 'トンガ', 'トリニダード・トバゴ', 'チュニジア', 'トルコ', 'トルクメニスタン', 'ツバル', 'ウガンダ', 'ウクライナ', 'アラブ首長国連邦', 'イギリス', 'アメリカ', 'ウルグアイ', 'ウズベキスタン', 'バヌアツ', 'バチカン', 'ベネズエラ', 'ベトナム', 'イエメン', 'ザンビア', 'ジンバブエ',
];

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
	return `https://commons.wikimedia.org/wiki/Special:FilePath/${qs.escape(fileName)}?width=800`;
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

const processedCountriesJsonFile = 'city-symbols-processed-countries.json';

for (const country of countries) {
	if (await fs.stat(`countries/region/${country}.png`).catch(() => null)) {
		continue;
	}

	console.log(`Downloading ${country}`);

	const imageUrl = getWikimediaImageUrl(`${country} in its region.svg`);
	await new Promise((resolve) => setTimeout(resolve, 200));
	let response = await fetch(imageUrl);
	if (response.status === 404) {
		console.log(`Retrying ${country} with (de-facto) suffix`);
		const imageUrl = getWikimediaImageUrl(`${country} in its region (de-facto).svg`);
		await new Promise((resolve) => setTimeout(resolve, 200));
		response = await fetch(imageUrl);
		if (response.status === 404) {
			console.log(`Retrying ${country} with (mainland) suffix`);
			const imageUrl = getWikimediaImageUrl(`${country} in its region (mainland).svg`);
			await new Promise((resolve) => setTimeout(resolve, 200));
			response = await fetch(imageUrl);
		}
	}
	const data = await response.arrayBuffer();
	const ext = getExtension(response.headers.get('content-type') || '');
	await fs.writeFile(`countries/region/${country}.${ext}`, Buffer.from(data));
}

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

await page.goto(`https://newmonic.baton8.com/deck/${process.env.NEWMONIC_COUNTRIES_DECK}`, {
	waitUntil: 'networkidle2',
});

const isDryRun = false;
const processedCountries = new Set<string>();

try {
	const processedCitiesJson = await fs.readFile(processedCountriesJsonFile, 'utf-8');
	const processedCityNames = JSON.parse(processedCitiesJson);
	for (const cityName of processedCityNames) {
		processedCountries.add(cityName);
	}
} catch (error) {
	await fs.writeFile(processedCountriesJsonFile, JSON.stringify([], null, 2));
	console.error(error);
}

const countryImages = await fs.readdir('countries/region');

for (const [i, country] of countries.entries()) {
	if (processedCountries.has(country)) {
		console.log(`Skipping ${country}...`);
		continue;
	}

	const japaneseCountryName = japaneseCountryNames[i];
	const japaneseOfficialCountryName = japaneseOfficialCountryNames[i];
	const countryImage = countryImages.find((image) => image.startsWith(country));

	if (isDryRun) {
		continue;
	}

	console.log(`Creating ${country}...`);

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

	await fileChooser.accept([`countries/region/${countryImage}`]);

	const answerHeadingNextSibling = await answerHeading.evaluateHandle((heading) => heading.nextElementSibling);
	const answerTextArea = await answerHeadingNextSibling.$('textarea');

	await answerTextArea.type(japaneseCountryName);

	const explanationHeadingNextSibling = await explanationHeading.evaluateHandle((heading) => heading.nextElementSibling);
	const explanationTextArea = await explanationHeadingNextSibling.$('textarea');

	await explanationTextArea.type(`正式名称: ${japaneseOfficialCountryName}`);

	await page.waitForSelector('h2::-p-text(問題) + div img');

	await page.screenshot({ path: 'screenshot2.png' });

	await Promise.all([
		page.click('button::-p-text(作成する)'),
		page.waitForSelector('button::-p-text(作成する)', { hidden: true }),
	]);

	await page.screenshot({ path: 'screenshot3.png' });

	processedCountries.add(country);
	await fs.writeFile('countries-processed-countries.json', JSON.stringify(Array.from(processedCountries), null, 2));

	await new Promise((resolve) => setTimeout(resolve, 2000));
}

await browser.close();