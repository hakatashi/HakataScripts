require! {
  fs
  path
  async
}

map = Object.create null

error, files <- fs.readdir \pixiv-ml-novels

return console.error error if error

files .= filter -> (it[-5 to].join '') is \.json

error <- async.each-limit files, 3, (file, done) ->
  console.log "Processing #{file}..."

  error, data <- fs.read-file path.join \pixiv-ml-novels file

  return done error if error

  novel = JSON.parse data

  chars = Array.from novel?.text

  for char in chars
    map[char] ||= 0
    map[char]++

  done!

if error
  console.error error

fs.write-file \map.json JSON.stringify map
