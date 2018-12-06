const {Iconv} = require('iconv');

const text = 
`
boot      -- 嶷尼強揃喇匂
cd        -- 個????
宴hinese   -- 嶄猟逸廁佚?
chmem     -- 俐個狼由坪贋方象
copy      -- 申唄猟周欺揃喇匂
date      -- 譜崔???寂
debug     -- 距編凋綜
delete    -- ?茅匯倖猟周
dir       -- ・?描贋ｱｵ?聯
english   -- ?猟逸廁佚?
exit      -- 曜指賜曜竃
format    -- 鯉塀晒猟周狼由
ip        -- IP 塘崔凋綜
md        -- 幹秀朕?
more      -- ・??倖?聯議坪否
ping      -- 霞編利大??
pwd       -- ・?輝念朕?
quit      -- 曜指賜曜竃
rd        -- ?茅匯倖??
reboot    -- 嶷尼強揃喇匂
rename    -- 個延猟周兆
show      -- ・?塘崔才彜蓑
`;

const encoder = new Iconv('UTF-8', 'ISO-2022-JP//IGNORE');
const decoder = new Iconv('HZ', 'UTF-8//IGNORE');

const buffer = encoder.convert(text);
console.log(buffer)
const decoded = decoder.convert(buffer).toString();
console.log(decoded)
