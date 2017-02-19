const Nightmare = require('nightmare');

const nightmare = Nightmare({webPreferences: {partition: 'nopersist'}});

nightmare
.goto('http://localhost:8080/nightmare-test.html')
.then(() => nightmare.evaluate(() => document.title))
.then((title) => {
	console.log(`Title: ${title}`);
	return nightmare.click('"]\'); document.title = \'blah\'; (\'"');
})
.catch((e) => console.error(e))
.then(() => nightmare.evaluate(() => document.title))
.then((title) => console.log(`Title: ${title}`))
.then(() => nightmare.end());
