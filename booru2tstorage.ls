require! {
  fs
  async
  request
}

error, tstorages <- async.map-series [823 til 1246], (booru, done) ->
  url = "http://mmda.booru.org/index.php?page=post&s=view&id=#{booru}"

  error, _, body <- request url
  return done error if error

  tstorage-match = body.to-string!match /Source: (\S+)/

  if tstorage-match
    link = tstorage-match.1
  else
    link = null

  matcher = /(:?value|href)="(http:\/\/tstorage\.info\/.+?|http:\/\/www\.mediafire\.com\/.+?|http:\/\/.+?\.deviantart\.com\/.+?)"/g

  other-links = (body.to-string!match(matcher) or []).map (string) -> string.match /(:?value|href)="(.+?)"/ .2

  <- set-timeout _, 1000
  console.log {link, other-links}
  done null, {link, other-links}

console.error error if error

<- fs.write-file \remaining-tstorages.json JSON.stringify tstorages
console.log \done
