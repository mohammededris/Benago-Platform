const serverless = require('serverless-http');
const express = require('express');
const app = express();
app.get('/api/ping', (req, res) => res.json({ pong: true }));
const handler = serverless(app);

const req = { url: '/api/ping', method: 'GET', headers: {} };
const res = {
  setHeader: () => {},
  end: (data) => console.log('REAL RES END CALLED:', data)
};

handler(req, res).then(result => {
  console.log('HANDLER PROMISE RESOLVED WITH:', result);
}).catch(console.error);
