var fft = require('fft-js').fft,
    signal = Array(1024).fill().map((_, i) => (Math.sin(i / 128 * Math.PI) + 1) / 2);
    console.log(signal);

var phasors = fft(signal);

console.log(phasors);