const fs = require('fs');

const lines = [
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '101010101010',
];

const offset = 800;

const csv = fs.readFileSync(process.argv[2]);
const rows = csv.toString().split('\r\n');
let levels = [];
for (const row of rows) {
  if (row.length === 0) {
    continue;
  }
  const [time, strength] = row.split(',').map((cell) => parseFloat(cell));
  let level = Math.floor(strength / 200) * 2;
  if (level === 0) {
    level = 0;
  } else if (level === 4 || level === 6) {
    level = 5;
  } else {
    level = 10;
  }
  const prevLevel = levels[levels.length - 1];
  if (prevLevel !== undefined && time - prevLevel.time <= 0.45 && prevLevel.level < level) {
	levels.pop();
	continue;
  }
  if (prevLevel === undefined || prevLevel.level !== level) {
	levels.push({level, time});
  }
}

for (const line of lines) {
  process.stdout.write(line + '\r\r\n')
}

for (const level of levels) {
  process.stdout.write(`${Math.round(level.time * 10000 + offset * 10000)}\t0\t${level.level}\t0\t0\r\r\n`);
}

