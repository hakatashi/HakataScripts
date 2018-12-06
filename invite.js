const axios = require('axios');
const {channels} = require('./channels.json');

(async () => {
  for (const channel of channels) {
    const {data} = await axios.post('https://slack.com/api/channels.invite', {
      channel: channel.id,
      user: 'UEJTPN6R5',
    }, {
      headers: {
        Authorization: `Bearer xoxp-4551938157-4551938159-463873755332-0495395fccb3c141f22d1d8a47321979`,
      },
    });
    console.log(data);
  }
})();
