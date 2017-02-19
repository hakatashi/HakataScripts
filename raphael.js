var jsdom = require('jsdom');
const fs = require('fs');

jsdom.env({
  html: '',
  scripts: ['node_modules/snapsvg/dist/snap.svg.js'],
  parsingMode: 'html',
  done: function (err, window) {
    var s = window.Snap(300, 300);
    var bigCircle = s.circle(150, 150, 100);
    fs.writeFile('temp.svg', s.node.outerHTML);
  }
});
