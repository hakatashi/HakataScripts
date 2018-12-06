const axios = require('axios');
const {channels} = require('./channels.json');

(async () => {
  for (const channel of channels) {
    const {data} = await axios.post('https://slack.com/api/channels.invite', {
      channel: channel.id,
      user: 'UEJTPN6R5',
    }, {
      headers: {
        Authorization: `Bearer xoxp-**********-**********-************-********************************`,
      },
    });
    console.log(data);
  }
})();
