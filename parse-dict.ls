require! {
  fs
  util
  readline
  'iconv-lite': iconv
  'prelude-ls': {map, empty, filter, unique}
  'msgpack-lite': msgpack
}

rl = readline.create-interface {
  input: fs.create-read-stream \dict.txt
    .pipe iconv.decode-stream \Shift_JIS
    .pipe iconv.encode-stream \UTF-8
  output: null
}

dict = []
word-lines = []
category =
  big: 0
  small: 0
  name: ''
i = 0

rl.on \line (line) ->
  matches = line.match /^(\d{4})\.(\d{2}) (.+)$/

  if matches
    parse-word-lines!

    [_, category.big, category.small, category.name] = matches

    category.big = category.big |> parse-int |> (- 1) |> Math.max 0 _
    category.small = category.small |> parse-int |> (- 1) |> Math.max 0 _

    category.name -= /\(.+?\)/g
    category.name -= /［.+?］/g

    dict.[][category.big].{}[category.small].name = category.name
    i++

  else if not line.match /^\d{4}/ and category.name isnt ''
    word-lines.push line

rl.on \close ->
  parse-word-lines!

  fs.write-file \parsed-dict.msgpack msgpack.encode dict

parse-word-lines = ->
  phase = null
  lines = []

  store-words = ->
    semi-categories = lines * ' ' / /[；]/
    for semi-category in semi-categories
      words = (semi-category - /\[.+?\]/g) / /(?:\s+|・)/
        |> map (- /\(.+?\)/g)
        |> map (- /《.+?》/g)
        |> map (- /〈.+?〉/g)
        |> map (- /\d{4}\.\d{2}/g)
        |> map (- /\d{4}/g)
        |> filter ((not) << empty)
        |> unique

      unless words |> empty
        if phase is null
          dict.[][category.big].{}[category.small].[]words.push words
        else
          dict.[][category.big].{}[category.small].{}relations.[][phase].push words
    lines := []

  for line in word-lines
    matches = line.match /^【(.+?)】/

    if matches
      store-words!
      phase = matches.1
      line -= /^【(.+?)】/

    lines.push line

  store-words!
  word-lines := []
