const fs = require('fs-extra');

(async () => {
  const data = await fs.readFileSync('qrcode.bmp');
  await fs.writeFile('qrcode.html', Buffer.from(`
    <!DOCTYPE html>
    <meta charset="ISO-8859-1">
    <p>${Buffer.from('919293a1a2a3', 'hex').toString('binary')}</p>
    <img src="${Buffer.from('919293a1a2a3', 'hex').toString('binary')}">
    <img src="%91%92%93%a1%a2%a3">
    <img src="data:image/bmp;iso-8859-1,${data.toString('binary').replace(/\0/g, '%00')}">
  `, 'binary'));
})();