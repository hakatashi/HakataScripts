require! {https, async}

ips = ["133.242.#{i}.#{j}" for i from 128 to 205 for j from 0 to 255]

error <- async.each-limit ips, 5, (ip, done) ->
  console.log "requesting #{ip}..."

  request = https.request {host: ip}, (response) ->
    response.pipe process.stdout
    response.on \end -> done null

  request.on \socket (socket) ->
    socket.set-timeout 3000
    socket.on \timeout ->
      console.log "Connection to #{ip} was timed out."
      request.abort!
      done null

  request.end!
