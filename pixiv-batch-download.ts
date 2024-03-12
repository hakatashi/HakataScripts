import axios from "axios";
import { get } from "lodash";
import download from "download";
import fs from "fs-extra";
import path from "path";
import { config } from "dotenv";

config();

const word = "キャラ配布(コイカツ)";
const session = process.env.PIXIV_SESSION;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
	await fs.mkdirp("D:/Pictures/pixiv-batch-download");
	let page = 1;

	while (true) {
		console.log(`Downloading illustrations... (page = ${page})`);

		await wait(1000);
		const data1 = await axios.get(
			`https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(word)}`,
			{
				params: {
					word,
					order: "popular_d",
					mode: "all",
					p: page,
					s_mode: "s_tag_full",
					type: "all",
					lang: "ja",
				},
				headers: {
					Cookie: `PHPSESSID=${session}`,
					'User-Agent': UA,
				},
				validateStatus: null,
			},
		);
		const illusts = get(data1, ["data", "body", "illustManga", "data"], []);

		if (illusts.length === 0) {
			break;
		}

		for (const illust of illusts) {
			await wait(1000);
			console.log(illust.id, 1);
			if (illust.id === undefined) {
				continue;
			}
			
			const { data: illustData } = await axios.get(
				`https://www.pixiv.net/ajax/illust/${illust.id}`,
				{
					headers: {
						Cookie: `PHPSESSID=${session}`,
						'User-Agent': UA,
					},
				},
			);
			await fs.writeJSON(
				path.join("D:/Pictures/pixiv-batch-download", `${illust.id}.json`),
				illustData,
			);

			await wait(1000);
			console.log(illust.id, 2);
			const data2 = await axios.get(
				`https://www.pixiv.net/ajax/illust/${illust.id}/pages?lang=ja`,
				{
					headers: {
						Cookie: `PHPSESSID=${session}`,
						'User-Agent': UA,
					},
				},
			);
			const pages = get(data2, ["data", "body"], []);
			console.log(`Retrieved ${pages.length} pages...`);

			for (const [i, page] of pages.entries()) {
				const originalUrl = get(page, ["urls", "original"]);
				if (typeof originalUrl === "string") {
					const filename = path.basename(originalUrl);
					if (await fs.pathExists(`D:/Pictures/pixiv-batch-download/${filename}`)) {
						console.log(`D:/Pictures/pixiv-batch-download/${filename} already exists. Skipping...`);
						continue;
					}

					for (const i of Array(10).keys()) {
						console.log(`Downloading ${filename}...`);
						console.log(originalUrl);

						await wait((2 ** i) * 1000);
						try {
							await download(originalUrl, "D:/Pictures/pixiv-batch-download", {
								filename,
								headers: {
									Referer: "https://www.pixiv.net",
									Cookie: `PHPSESSID=${session}`,
									'User-Agent': UA,
								},
							});
							break;
						} catch (e) {
							console.error(e);
						}
					}
				}
			}
		}

		page++;
	}
})();
