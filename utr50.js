var fs = require('fs');

var start = -Infinity;
var end = -Infinity;

var ret = '';

fs.readFileSync('utr50.txt').toString().split('\r\n').forEach(function (line) {
    tokens = line.split('..').map(function (string) {
        return parseInt(string, 16);
    });

    if (tokens.length === 1) {
        tokens[1] = tokens[0];
    }

    if (tokens[0] - 1 === end) {
        end = tokens[1];
    } else {
        if (start === end) {
            ret += '\\u' + ('0000' + start.toString(16)).slice(-4);
        } else {
            ret += '\\u' + ('0000' + start.toString(16)).slice(-4) + '-\\u' + ('0000' + end.toString(16)).slice(-4);
        }
        start = tokens[0];
        end = tokens[1];
    }
});

if (start === end) {
    ret += '\\u' + ('0000' + start.toString(16)).slice(-4);
} else {
    ret += '\\u' + ('0000' + start.toString(16)).slice(-4) + '-\\u' + ('0000' + end.toString(16)).slice(-4);
}

fs.writeFileSync('utr50reg.txt', ret);
