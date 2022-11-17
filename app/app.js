const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const https = require('https');

const app = express();
app.use(bodyParser.json());
const port = 8443;

const options = {
  ca: fs.readFileSync('./cert/ca.crt'),
  cert: fs.readFileSync('./cert/server.crt'),
  key: fs.readFileSync('./cert/ca.key'),
};

app.get('/hc', (req, res) => {
  console.log('---->hc')
  res.send('ok');
});

app.post('/', (req, res) => {
  console.log('---->:', req.body)
  if (
    req.body.request === undefined ||
    req.body.request.uid === undefined
  ) {
    res.status(400).send();
    return;
  }
  console.log(req.body); // DEBUGGING
  const { request: { uid } } = req.body;
  res.send({
    apiVersion: 'admission.k8s.io/v1',
    kind: 'AdmissionReview',
    response: {
      uid,
      allowed: true,
    },
  });
});

process.on('SIGTERM', close.bind(this, 'SIGTERM'));
process.on('SIGINT', close.bind(this, 'SIGINT'));

function close(signal) {
  console.log(`收到 ${signal} 信号开始处理`);

  setInterval(() => {
    console.log(`服务停止 ${signal} 处理完毕`);
    process.exit(0);
  }, 1000)
}

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`Server running on port ${port}/`);
});