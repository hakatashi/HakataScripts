require! {
  fs
  jsdom
}

error, png <- fs.read-file 'trump.png'

error, window <- jsdom.env do
  * ''
  * ["node_modules/apng-canvas/build/apng-canvas.min.js"]

{APNG} = window

data = APNG.parse-buffer png.buffer
console.log data
