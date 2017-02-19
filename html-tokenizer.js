var fs = require('fs');
var tokenize = require('html-tokenize');
var through = require('through2');

var tokenizer = tokenize();

tokenizer.pipe(through.obj(function (row, enc, next) {
    row[1] = row[1].toString();
    console.log(row);
    next();
}));

tokenizer.end(`
    <?xml version="1.0"?>
    <!DOCTYPE html>
    <html>
      <div>
        <div>
          <pre>
            漢字
            汉字
        </div>
        漢字
        汉字
      </div>
    </html>
`);
