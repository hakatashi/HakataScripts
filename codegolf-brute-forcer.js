const tmp = require('tmp');
const {default: Queue} = require('p-queue');
const {promises: fs} = require('fs');
const {spawn} = require('child_process');
const {random} = require('lodash');

const queue = new Queue({concurrency: 8});

const getTempFile = () => new Promise((resolve, reject) => {
	tmp.file((error, path, fd, cleanup) => {
		if (error) {
			reject(error);
		} else {
			resolve({ path, fd, cleanup });
		}
	});
});

const runTest = (async () => {
	let vim = null;
	let cleanup = null;
	let timeoutId = null;

	const vector = [
		random(0x20, 0x7E),
		random(0x20, 0x7E),
		random(0x20, 0x7E),
	];

	const run = async (input = '4\n3 15\nhoge\n', out = '22') => {
		const [
			{path: inputPath, cleanup: cleanup1},
			{path: codePath, cleanup: cleanup2},
		] = await Promise.all([
			getTempFile(),
			getTempFile(),
		]);

		cleanup = () => {
			cleanup1();
			cleanup2();
		};

		await fs.writeFile(inputPath, input);
		await fs.writeFile(codePath, Buffer.from([
			0x44, 0x4a, 0x40, 0x22, 0x01,
			...vector,
			0x40, 0x22, 0x01, 0x4a, 0x5a, 0x5a,
		]));

		vim = spawn('vim', [
			'-n',
			'-N',
			'-u', 'NONE',
			'-i', 'NONE',
			'-s', codePath,
			inputPath,
		], {env: {TERM: 'dumb'}});
		await new Promise((resolve) => {
			vim.on('close', resolve);
		});

		vim = null;
		const output = await fs.readFile(inputPath);

		if (output.toString().startsWith(out)) {
			if (out === '22') {
				console.log(Buffer.from(vector).toString());
				await run('27\n93 62\nfuga', '182');
			} else {
				console.log(Buffer.from(vector).toString(), output.toString());
			}
		}
	};

	const timeout = new Promise((resolve, reject) => {
		timeoutId = setTimeout(() => {
			reject();
		}, 300);
	});

	try {
		await Promise.race([run(), timeout]);
	} catch (error) {
		// console.log('timed out');
	} finally {
		if (cleanup) {
			cleanup();
		}
		if (vim) {
			vim.kill('SIGKILL');
		}
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	}
});

(async () => {
	while (true) {
		await new Promise(async (resolve) => {
			let done = 0;
			for (const i of Array(1000).keys()) {
				queue.add(async () => {
					await runTest();
					done++;
					if (done === 1000) {
						console.log(done);
						resolve();
					}
				});
			}
		});
	}
})();
