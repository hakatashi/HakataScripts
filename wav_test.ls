require! {
  fs
  wav
  async
}

writer = fs.create-write-stream 'test.wav'
wavifier = new wav.Writer!

wavifier.pipe writer

chunk = (L, R) ->
  R = L if R is undefined
  buffer = Buffer.alloc 4
  buffer.write-int16LE Math.min(Math.max(-0x7FFF, L), 0x7FFF), 0
  buffer.write-int16LE Math.min(Math.max(-0x7FFF, R), 0x7FFF), 2
  buffer

state = 1
continuous = 0
total = 44100 * 1

error <- async.times total, (i, done) ->
  if i % 10 is 0
    if continuous >= 2 or Math.random! < 0.5
      state *= -1
      continuous := 1
    else
      continuous++
  if Math.floor(total / 100 * Math.floor(i / total * 100)) is i
    console.log i
  wavifier.write chunk 0x3FFF * state
  done!

wavifier.end!
