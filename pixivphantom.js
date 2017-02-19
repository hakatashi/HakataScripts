var webPage = require('webpage');
var page = webPage.create();

page.open('http://www.pixiv.net/', function(status) {
  console.log('Status: ' + status);
  page.render('pixiv.png');
  phantom.exit();
});
