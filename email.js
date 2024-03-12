require('dotenv').config();

const DOMAIN = 'hakatashi.com';
const api_key = process.env.MAILGUN_API_KEY;
const mailgun = require('mailgun-js')({ apiKey: api_key, domain: DOMAIN });

const html = `
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td style="text-align: center;">
<img src="https://score.ctf.tsg.ne.jp/themes/tsgctf/static/ogimage.jpg" alt="TSG CTF 2021" style="max-width: 600px;">
</td>
</tr>
</table>

<p>
Notice: This email is being sent to the users who registered the past years' TSG CTF. If you wish to unsubscribe, click <a href="%unsubscribe_url%">here</a>.
</p>

<p>
Hello hackers! We wish you enjoyed the last year's TSG CTF. Now we are back with more refined, fun, and non-guessy (of course!) challenges that make you more amused! This email is a "friendly reminder" that tells you that TSG CTF 2021 is going to be held this weekend, from October 2 07:00 to October 3 07:00 (UTC)!
</p>

<p>
Also, it's worth mentioning that the top hackers will be rewarded by dollars. The 1st place is 513.37 USD, 2nd is 213.37 USD, and 3rd is 113.37 USD. Stay home and save money!
</p>

<p>
The scoreboard is ready. Register now!<br>
https://score.ctf.tsg.ne.jp/
</p>

<p>
Sincerely,<br>
Koki Takahashi (@hakatashi), a leader of team TSG
</p>`.trim();


const text = `
Notice: This email is being sent to the users who registered the past years' TSG CTF. If you wish to unsubscribe, go %unsubscribe_url%

Hello hackers! We wish you enjoyed the last year's TSG CTF. Now we are back with more refined, fun, and non-guessy (of course!) challenges that make you more amused! This email is a "friendly reminder" that tells you that TSG CTF 2021 is going to be held this weekend, from October 2 07:00 to October 3 07:00 (UTC)!

Also, it's worth mentioning that the top hackers will be rewarded by dollars. The 1st place is 513.37 USD, 2nd is 213.37 USD, and 3rd is 113.37 USD. Stay home and save money!

The scoreboard is ready. Register now!
https://score.ctf.tsg.ne.jp/

Sincerely,
Koki Takahashi (@hakatashi), a leader of team TSG
`.trim();

const data = {
	from: 'TSG <info@tsg.ne.jp>',
	to: 'tsgctf-announcements@hakatashi.com',
	subject: 'Invitation to TSG CTF 2021',
	text,
	html,
};

mailgun.messages().send(data, (error, body) => {
	console.log(error, body);
});
