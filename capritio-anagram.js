const fs = require('fs');

const charset = 'ふやはひてぺにゅーとんめいぎけざみすこつごほやもももももも';

const data = fs.readFileSync('kojien-entries.tsv', 'utf-8');
for (const line of data.split('\n')) {
  if (!line) {
    break;
  }
  const [word, ruby, meaning] = line.split('\t');
  const charsetChars = Array.from(charset);
  const chars = Array.from(ruby);
  let ok = true;
  for (const char of chars) {
    const index = charsetChars.indexOf(char);
    if (index === -1) {
      ok = false;
      break;
    }
    charsetChars.splice(index, 1);
  }
  if (ok && ruby.length >= 6) {
    console.log(line);
  }
}