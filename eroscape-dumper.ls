require! {fs, async, request, cheerio, \csv-stringify}

stringifier = csv-stringify!
writer = fs.create-write-stream \erogamescape-dump.csv

stringifier.pipe writer

var records-got
record-from = 0

error <- async.do-whilst do
  (done) ->
    console.log "Getting records between #{record-from} and #{record-from + 10000}..."

    error, response, body <- request.post do
      url: 'http://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/sql_for_erogamer_form.php'
      form:
        sql: """
          SELECT *
          FROM userreview
          WHERE hitokoto IS NOT NULL
          AND id BETWEEN #{record-from} AND #{record-from + 10000}
        """

    fs.write-file \dump.html body

    return done error if error

    unless response.status-code is 200
      return done new Error "Status code is #{response.status-code}"

    $ = cheerio.load body

    $table = $ '#query_result_main table'

    if $table.length is 0
      return done new Error 'Result table is not found'

    records-got := false

    $table.find \tr .each !->
      params = $ this .children \td .map(-> $ this .text!).to-array!
      stringifier.write params unless params.length is 0
      records-got := true

    record-from += 10000

    console.log 'Waiting for 30 minutes...'
    set-timeout do
      -> done null
      30 * 60 * 1000

  -> records-got

if error
  console.error error
else
  console.log 'Succefully done!'
