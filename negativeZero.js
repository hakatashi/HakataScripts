var myZero = +0;

var negZero = Buffer('8000000000000000', 'hex')

var buf = Buffer(8);
buf.writeDoubleBE(myZero);

if (buf.equals(negZero)) {
	// myZero is -0
	console.log('-0');
} else {
	// myZero is +0
	console.log('+0');
}
