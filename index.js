/**
 * Created by vignesh on 09/09/16.
 */
'use strict';

var server = require('./server/app').server;
var express = require('./server/app').express;
var metrics = require('./server/metrics');
var hooks = require('./server/events');
var debug = require('debug')('node-monitor-ui:index')

module.exports.express = express;
module.exports.Hooks = hooks;

module.exports.init = function (port = 3001) {

    server.listen(port, function (err) {
        if (err) throw err;
        debug(`Metrics Server Listening on port 0.0.0.0:${port}`);
        metrics.init();
    });

};



