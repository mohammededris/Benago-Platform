const express = require('express');
const app = express();
app.get('/api/ping', (req, res) => res.json({ pong: true }));

// Mock Vercel req, res
const EventEmitter = require('events');
const req = new EventEmitter();
req.url = '/api/ping';
req.method = 'GET';
req.headers = {};

const res = new EventEmitter();
res.setHeader = (k, v) => console.log('setHeader', k, v);
res.end = (data) => console.log('REAL RES END CALLED:', data);
res.statusCode = 200;

app(req, res);
