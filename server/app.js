/**
 * Created by vignesh on 09/09/16.
 */

'use strict';

const path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/ui', express.static(path.resolve('node_modules/node-monitor-ui/ui')));
app.use('/node_modules', express.static(path.resolve('node_modules/node-monitor-ui/node_modules')));

io.on('connect', (socket) => {
  console.log('Client Connected');

  socket.on('logs', (log)=> {
    socket.broadcast.emit('logs',log);
    console.log('00>', log);
  })
});


app.get('/', (req, res)=> {
  console.log('Req logger....');
  res.sendFile(path.resolve('node_modules/node-monitor-ui/ui/index.html'));
  //res.sendFile(path.resolve('ui/index.html'));
});


module.exports.server = http;
module.exports.express = app;
module.exports.io = io;