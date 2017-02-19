require! {
  'pixiv-novel-parser': {Parser}
  kuromojin: {get-tokenizer}
  async
  fs
}

writer = fs.create-write-stream \kankore2vec.txt

tokenizer <- get-tokenizer!then

error, files <- fs.readdir \pixiv-kankore-word2vec
throw error if error

files .= filter -> (it[-5 to].join '') is \.json

error <- async.each-limit files, 3, (file, done) ->
  error, data <- fs.read-file "pixiv-kankore-word2vec/#{file}"
  return done error if error

  novel = JSON.parse data

  parser = new Parser!
  parser.parse novel.text

  root-node = parser.tree

  plainify = (node) ->
    | Array.is-array node
      node.map plainify .join ''
    | node.type is \text
      node.val
    | node.type is \tag
      switch node.name
        | \rb => node.ruby-base
        | \jump => ' '
        | \jumpuri => plainify node.title
        | \pixivimage => ' '
        | \chapter => plainify node.title
        | \newpage => ' '

  plain-text = plainify root-node

  tokens = tokenizer.tokenize plain-text

  tokenized-text = tokens.map ->
    | it.surface_form in ['\r\n' '\n'] => '<br>'
    | it.pos_detail_1 is '空白' => null
    | it.surface_form in <[、 ・]> => it.surface_form
    | it.pos is '名詞' and it.pos_detail_1 is '数' => 'N'
    | it.word_type is 'UNKNOWN' => it.surface_form
    | otherwise => it.basic_form
  .filter (?) .join ' ' .replace /\r?\n/g ' '

  writer.write tokenized-text + '\n'
  console.log "Processed #{novel.id}"

  done!

throw error if error

writer.end!
console.log 'done'
