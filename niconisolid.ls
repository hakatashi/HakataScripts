require! {
  fs
  nightmare: Nightmare
  'nightmare-download-manager'
}

nightmare-download-manager Nightmare

fetch = (i) ->
  error, list <- fs.read-file 'niconisolid-list.txt'
  throw error if error

  files = list.to-string!split '\n' .filter (.length > 0)

  if i >= files.length
    return console.log 'Completed'

  file = files[i]
  console.log "Downloading #file..."

  Nightmare {-show, +center, download-response-wait: 10000, paths: downloads: "#{__dirname}/downloads"}
  .cookies.set do
    name: 'user_session'
    value: 'user_session_11916140_a87d947f0c6cee95d6f396dde516be49137febd7cb2c236e6a51e3d209ef2c08'
    path: '/'
    url: 'http://3d.nicovideo.jp/'
  .download-manager!
  .goto file
  .wait 'a.button-download'
  .click 'a.button-download'
  .wait 'a.button-submit'
  .click 'a.button-submit'
  .waitDownloadsComplete!
  .end!
  .then ->
    console.log "Downloaded #file"
    fetch i + 1
  .catch (e) ->
    console.log "Aborted #file"
    console.error e
    fetch i + 1

fetch 0
