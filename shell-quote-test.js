const sq = require('shell-quote');
const exec = require('child_process').exec;

exec('cat dump.html | ' + sq.quote(['grep', ';<emtest.c']), (error, stdout, stderr) => console.log(stdout));
