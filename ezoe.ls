require! {
  \fs
  \async
  \cheerio
  \request
  \chrono-node
}

last-status = null
page = 0

data = []

error <- async.whilst do
  -> (last-status ? 200) is 200
  (done) ->
    console.log "Fetching page #{page}..."

    error, response, body <- request do
      url: 'https://ask.fm/EzoeRyou/answers/more'
      qs: {page}

    return done error if error

    last-status := response.status-code

    return done! if last-status isnt 200

    $ = cheerio.load body

    $ '.item' .each ->
      $item = $ this
      data.push do
        question: $item.find '.streamItemContent-question' .text!trim!
        answer: $item.find '.streamItemContent-answer' .text!trim!
        timestamp: $item.find '.streamItemsAge' .data \hint .trim! |> chrono-node.parse-date |> (.to-ISO-string!)
        likes: $item.find '.counter' .text!trim! |> parse-int

    page++

    console.log 'Sleeping...'
    set-timeout done, 1000

if error
  console.error error

fs.write-file \data.json JSON.stringify data
