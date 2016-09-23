/**
 * Created by vignesh on 12/09/16.
 */
'use strict';


var app = angular.module('myApp');

/**
 * DashBoard Controller
 * --------------------
 *
 */
app.controller('DashBoardController', ['DOB', 'db', '$window', 'google', '$scope', '$interval',
  function (DOB, db, $window, google, $scope, $interval) {

    this.paused = false;
    this.showGC = true;
    this.liveDuration = 30; //In secs
    this._dashDrawInterval = undefined;
    var dbChanges = undefined;

    this.togglePause = () => {
      this.paused = !this.paused
    };

    var data = new google.visualization.DataTable();
    data.addColumn('datetime', 'Date');
    data.addColumn('number', 'rss');
    data.addColumn({type: 'string', role: 'annotation'});
    data.addColumn({type: 'string', role: 'annotationText'});
    data.addColumn('number', 'heapTotal');
    data.addColumn({type: 'string', role: 'annotation'});
    data.addColumn({type: 'string', role: 'annotationText'});
    data.addColumn('number', 'heapUsed');
    data.addColumn('number', 'cpu');

    var cpuOptions = {
      chart: {
        title: 'CPU Usage',
      },
      legend: {position: 'none'},
      hAxis: {
        title: 'Time'
      },
      vAxis: {
        title: 'CPU %'
      },
      backgroundColor: 'rgb(250,250,250)',
      //animation: {duration: 500, startup: true, easing: 'inAndOut'},
      //width: 100,
      height: 250
    };

    var memoryOptions = {
      chart: {
        title: 'Memory Usage',
      },
      legend: {position: 'top'},
      hAxis: {
        title: 'Time'
      },
      vAxis: {
        title: 'Memory (MB)'
      },
      backgroundColor: 'rgb(250,250,250)',
      //animation: {duration: 500, startup: true, easing: 'inAndOut'},
      //width: 100,
      height: 250,

    };

    var filterOptions = {
      'filterColumnLabel': 'Date',
      ui: {
        chartOptions: {
          legend: {position: 'none'},
          backgroundColor: 'rgb(250,250,250)',
          annotations: {
            textStyle: {
              fontName: 'Times-Roman',
              fontSize: 0,
              opacity: 0
            }
          }
        }
      }
    };

    var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard'));
    var dateRangeSlider = new google.visualization.ControlWrapper({
      'controlType': 'ChartRangeFilter',
      'containerId': 'filter',
      'options': filterOptions
    });
    var cpuChart = new google.visualization.ChartWrapper({
      'chartType': 'LineChart',
      'containerId': 'cpu_chart',
      'options': cpuOptions,
      'view': {'columns': [0, 8, 2, 3]}
    });
    var memoryChart = new google.visualization.ChartWrapper({
      'chartType': 'LineChart',
      'containerId': 'memory_chart',
      'options': memoryOptions,
      'view': {'columns': [0, 1, 2, 3, 4, 5, 6, 7]}
    });


    dashboard.bind(dateRangeSlider, [cpuChart, memoryChart]);


    this.updateDashboard = (info) => {
      data.addRow([new Date(info.timestamp),
        info.memory.rss,
        info.annotation || undefined,
        info.annotationText || undefined,
        info.memory.heapTotal,
        info.heapAnnotation || undefined,
        info.heapAnnotationText || undefined,
        info.memory.heapUsed,
        info.cpu]);

      if (!this.paused) {
        dateRangeSlider.setState({
          range: {
            start: new Date(new Date().setSeconds(new Date().getSeconds() - this.liveDuration)),
            end: new Date()
          }
        });
      }

    };


    var formatData = (data) => {

      if (data.gc && this.showGC) {
        data.heapAnnotation = `GC - ${data.gc.type}`;
        data.heapAnnotationText = data.gc.type;
      }

      if (data.event) {
        var event = data.event;
        if (event.timeDelta) {
          data.annotation = `*${event.label} - End`;
          data.timestamp = event.endTime;
          data.annotationText = `Exec Time: ${event.timeDelta}`
        } else {
          data.timestamp = event.startTime;
          data.annotation = `*${event.label} - Start`;
          if (event.desc) data.annotationText = event.desc;
        }


      }

      return data;

    };


    dbChanges = db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      filter: function (doc) {
        return !doc._deleted && doc.type !== 'logstream';
      }
    }).on('change', (change) => {

      this.updateDashboard(formatData(change.doc));
    }).on('error', function (err) {
      // handle errors
      console.error(err);
    });


    this.init = () => {

      console.debug('---> DashBoard Controller Init <----');

      db.changes({
        since: 0,
        include_docs: true
      }).then((changes) => {

        changes.results.forEach((item)=> {
          //console.log('item-->', item.doc);
          if (item.doc.type !== 'logstream') this.updateDashboard(formatData(item.doc))
        })
      }).catch(function (err) {
        // handle errors
      });
    };

    $scope.$on("$destroy", () => {
      $interval.cancel(this._dashDrawInterval);
      dbChanges.cancel();

    });


    this._dashDrawInterval = $interval(()=> {
      dashboard.draw(data)
    }, 1000);

    this.clearData = () => {
      data.removeRows(0, data.getNumberOfRows() - 1);
      dashboard.draw(data);
    };

    this.liveDurationChanged = () => {
      dateRangeSlider.setState({
        range: {
          start: new Date(new Date().setSeconds(new Date().getSeconds() - this.liveDuration)),
          end: new Date()
        }
      });
    }

  }]);


app.controller('LogStreamController', ['db', '$scope', '$window', '$filter', function (db, $scope, $window, $filter) {

  var logs = [];
  this.logs = [];
  this.filters = {warn: true, info: true, debug: true, error: true};
  this.isPaused = false;
  var dbObserver = undefined;

  this.evalFilters = function () {

    this.logs = $filter('filter')(logs, (value) => {
      return this.filters[value.level];
    }, true);

  };

  dbObserver = db.changes({
    since: 'now',
    live: true,
    include_docs: true,
    filter: function (doc) {
      return !doc._deleted && doc.type === 'logstream';
    }
  }).on('change', (change) => {
    change.doc.timestamp = new Date(change.doc.timestamp);
    logs.push(change.doc);
    $scope.$apply(()=> {
      this.evalFilters();
    });
  }).on('error', function (err) {
    console.error(err);
  });

  this.init = function () {
    db.changes({
      since: 0,
      include_docs: true,
      filter: function (doc) {
        return !doc._deleted && doc.type === 'logstream'
      }
    }).then((changes)=> {
      changes.results.forEach((item)=> {
        item.doc.timestamp = new Date(item.doc.timestamp);
        logs.push(item.doc);
      });
      $scope.$apply(() => {
        this.evalFilters();
      });
    })
  };

  $scope.$on('$destroy', ()=> {
    dbObserver.cancel();
  });


  this.togglePause = function () {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) this.scrollToView();
  };

  this.scrollToView = function () {
    if (this.isPaused) return;
    var elem = $window.document.getElementById('log_wrapper');
    elem.children[elem.childElementCount - 1].scrollIntoView();
  };

  this.clearLogs = function () {
    logs = [];
    this.evalFilters();
  }


}]);