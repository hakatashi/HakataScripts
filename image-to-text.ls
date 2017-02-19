require! {
  fs
  pngjs: {PNG}
  'color-convert'
}

color-names = <[
  朱 #EF454A
  桃 #E38089
  桜 #FBDADE
  茜 #9E2236
  赤 #BE0032
  鴇 #FA9CB8
  紅 #BE003F
  紫 #A757A8
  菫 #714C99
  藤 #A294C8
  勝 #3A3C4F
  紺 #343D55
  鉛 #72777D
  縹 #2B618F
  藍 #2B4B65
  青 #006AB6
  空 #89BDDE
  水 #9DCCE0
  鉄 #24433E
  緑 #00B66E
  草 #737C3E
  苔 #7C7A37
  鶸 #C2BD3D
  鶯 #706C3E
  黄 #E3C700
  砂 #C5B69E
  卵 #F4BD6B
  褐 #6B3E08
  土 #9F6C31
  橙 #EF810F
  杏 #D89F6D
  茶 #6D4C33
  肌 #F1BB93
  栗 #704B38
  樺 #B64826
  柿 #DB5C35
  錆 #624035
  鳶 #7A453D
  白 #F0F0F0
  鼠 #838383
  灰 #767676
  墨 #343434
  黒 #2A2A2A
]>.map (element, index, array) ->
  if index % 2 is 0
    [L, a, b] = color-convert.hex.lab.raw array[index + 1].slice 1
    [R, G, B] = color-convert.hex.rgb.raw array[index + 1].slice 1
    [element, {L, a, b, R, G, B}]
  else
    null
.filter (isnt null)
|> new Map _

if process.argv.length isnt 3
  console.error "Usage: lsc #{process.argv[1]} <png file>"
  process.exit 1

png-file = process.argv[2]
png-reader = new PNG!

<- fs.create-read-stream png-file .pipe png-reader .on 'parsed'
png = this
ptr = 0

for y from 0 til png.height
  for x from 0 til png.width
    [r, g, b, a] = png.data.slice ptr, ptr + 4
    [L1, a1, b1] = color-convert.rgb.lab.raw r, g, b

    min-distance = Infinity
    min-color-name = null

    entries = color-names.entries!
    until (iterator = entries.next!).done
      [name, {L: L2, a: a2, b: b2}] = iterator.value

      Ldiff = (L1 - L2) * 2
      adiff = a1 - a2
      bdiff = b1 - b2

      distance = Math.sqrt Ldiff ** 2 + adiff ** 2 + bdiff ** 2

      if distance < min-distance
        min-distance = distance
        min-color-name = name

    process.stdout.write min-color-name

    min-color-value = color-names.get min-color-name

    png.data[ptr] = min-color-value.R
    png.data[ptr + 1] = min-color-value.G
    png.data[ptr + 2] = min-color-value.B
    png.data[ptr + 3] = 255

    ptr += 4

  console.log ''

png-writer = fs.create-write-stream 'image-to-text-preview.png'

png.pack!pipe png-writer
