# node-monitor-ui

node-monitor-ui provides a simple ui interface to look at realtime 
- CPU usage
- RAM usage
- Garbage Collection (GC) events
- Function triggers

[![Screen Shot 2016-09-20 at 10.12.03 AM.png](http://s13.postimg.org/4xog7ms6f/Screen_Shot_2016_09_20_at_10_12_03_AM.png)](http://postimg.org/image/sbwfjka3n/)
    
## Installation
node-monitor-ui uses es6 features and as such will work on node versions that support es6 explictly. For node v4.x you will have to add the flags `--harmony` and `--harmony_destructuring` during runtime of your node process.
```sh
npm install node-monitor-ui
```
## Usage
``` js
var metrics = require('node-monitor-ui');
metrics.init(port);
```
- port is the http port on which the ui interface will be served. Defaults to 3001.

The UI can then be accessed from http://localhost:port

### Function Hooks
You can add hooks to the function to identify the beginning and ending of the execution on your metric graphs. This allows you to see how the function execution affects your cpu and memory of your process. 

#### Example
``` js
function exampleHook(){
    var hook = new metrics.Hooks('Hook Label', 'Hook Description');
    .....
    .....
    .....
    hook.end();
}
```

## Logging
Logs could be streamed to the dashboard, if your logging module is [winston](https://www.npmjs.com/package/winston). You will have to add [winston-node-monitor-ui](https://www.npmjs.com/package/winston-node-monitor-ui) module from npm. 
[![Screen Shot 2016-09-23 at 10.33.04 AM.png](http://s21.postimg.org/m81q085lj/Screen_Shot_2016_09_23_at_10_33_04_AM.png)](http://postimg.org/image/efb288zmb/)


## TODOs
* Filter the graphs for a specific function label.
* Aggregate the GC events and provide statistical info such as the (frequency of occurrence, average time of GC execution, etc.)
* Aggregate individual function execution and display the statistics (average cpu, memory, run time) for each of those functions.
* Collect the metrics data from multiple processes and display them on aggregated charts. 
* Filter log streams using time filters.