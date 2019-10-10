const fs = require('fs-extra');
const klaw = require('klaw');
const {spawn} = require('child_process');
const concatStream = require('concat-stream');
const {default: Queue} = require('p-queue');

const queue = new Queue({concurrency: 1});

const exec = async (command, args) => {
	console.log(`$ ${command} ${args.join(' ')}`);

	const proc = spawn(command, args);

	const [stdout, stderr] = await Promise.all([
		new Promise((resolve) => {
			proc.stdout.pipe(concatStream({encoding: 'buffer'}, (data) => {
				resolve(data);
			}));
		}),
		new Promise((resolve) => {
			proc.stderr.pipe(concatStream({encoding: 'buffer'}, (data) => {
				resolve(data);
			}));
		}),
		new Promise((resolve) => {
			proc.on('close', (code) => {
				if (code !== 0) {
					console.error(`Non-Zero exit code: ${code}`);
				}
				resolve(code);
			});
		}),
	]);

	return {stdout, stderr};
};

(async () => {
	const walker = klaw('/mnt/c/Users/denjj/Documents/GitHub/commander.js');
	let files = 0;
	const spiderMonkey = {syntaxErrors: 0, runtimeErrors: 0};
	const rhino = {syntaxErrors: 0, runtimeErrors: 0};

	walker.on('data', (item) => {
		if (item.stats.isDirectory() || !item.path.endsWith('.js')) {
			return;
		}
		queue.add(async () => {
			files++;

			{
				const {code, stderr} = await exec('/home/hakatashi/mozjs-59.0a1.0/js/src/build_OPT.OBJ/dist/bin/js', [
					'-f', item.path,
				]);
				if (stderr.toString().match(/syntaxerror/i)) {
					spiderMonkey.syntaxErrors++;
				} else if (code !== 0) {
					spiderMonkey.runtimeErrors++;
				}
			}

			{
				const {code, stderr} = await exec('java', [
					'-jar', '/home/hakatashi/rhino1.7.9/lib/rhino-1.7.9.jar',
					item.path,
				]);
				if (stderr.toString().match(/syntax error/i)) {
					rhino.syntaxErrors++;
				} else if (code !== 0) {
					rhino.runtimeErrors++;
				}
			}
		})
	});

	walker.on('end', () => {
		queue.add(() => {
			console.log({files, spiderMonkey, rhino});
		});
	});
})();