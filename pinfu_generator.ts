const 数牌 = [
  ['１', '２', '３', '４', '５', '６', '７', '８', '９'],
  ['一', '二', '三', '四', '五', '六', '七', '八', '九'],
  ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'],
];

const 風牌 = ['南', '西', '北'];

const 牌 = [数牌.flat(), 風牌];
const 牌Order = [...数牌.flat(), ...風牌];

const rand = (max: number) => Math.floor(Math.random() * max);

const normal平和 = [];
const special平和 = [];

for (const i of Array(10000).keys()) {
  const 牌s = [];

  for (const j of Array(3).keys()) {
    const 数 = rand(7);
    const 色 = rand(3);

    牌s.push(数牌[色][数]);
    牌s.push(数牌[色][数 + 1]);
    牌s.push(数牌[色][数 + 2]);
  }

  const tmp = Number(rand(4) === 0);
  const 雀頭 = 牌[tmp][rand(牌[tmp].length)];
  牌s.push(雀頭);
  牌s.push(雀頭);

  let 自摸 = null;
  {
    const 数 = rand(6) + 1;
    const 色 = rand(3);
    牌s.push(数牌[色][数]);
    牌s.push(数牌[色][数 + 1]);

    if (rand(2) === 0) {
      自摸 = 数牌[色][数 + 2];
    } else {
      自摸 = 数牌[色][数 - 1];
    }
  }

  牌s.sort((a, b) => 牌Order.indexOf(a) - 牌Order.indexOf(b));

  if (牌s.every(牌 => !['１', '９', '一', '九', '①', '⑨', '南', '西', '北'].includes(牌))) {
    continue;
  }
  
  const 色s = 牌s.filter(牌 => 数牌.flat().includes(牌)).map(牌 => 数牌.findIndex(牌s => 牌s.includes(牌)));
  if (new Set(色s).size < 2) {
    continue;
  }

  const maxCount = 牌Order.map(牌 => [...牌s, 自摸].filter(牌2 => 牌2 === 牌).length).reduce((a, b) => Math.max(a, b));
  if (maxCount > 4) {
    continue;
  }
  if (maxCount === 4) {
    special平和.push(`${牌s.join('')} ツモ${自摸}`);
  } else {
    normal平和.push(`${牌s.join('')} ツモ${自摸}`);
  }
}

console.log(special平和.slice(0, 70).join('\n'));
console.log(normal平和.slice(0, 30).join('\n'));
