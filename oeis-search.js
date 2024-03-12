const fs = require('fs/promises');

(async () => {
  const data = await fs.readFile('./stripped-oeis.txt', 'utf-8');
  for (const line of data.split('\n')) {
    const [id, ...seq] = line.split(',');
    if (seq.length <= 47) {
      continue;
    }

    if (
      seq[0] !== '2' ||
      seq[1] !== '3' ||
      seq[2] !== '5' ||
      seq[3] !== '7' ||
      seq[4] !== '13'
    ) {
      continue;
    }

    for (const [i, n] of seq.entries()) {
      if (i < 4) {
        if (n.length !== 1) {
          break;
        }
      } else if (i < 18) {
        if (n.length !== 2) {
          break;
        }
      } else if (i < 47) {
        if (n.length !== 3) {
          break;
        }
      } else {
        console.log(id, seq.join(','));
        break;
      }
    }
  }
})();