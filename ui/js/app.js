/**
 * Created by vignesh on 09/09/16.
 */
"use strict";


angular.module('myApp').controller('coreController', ['Socket', '$window','db', function (Socket, $window,db) {
  console.log('TET');


  function drawChart() {
    //drawChart1();
    //drawChart3();
  }

  function drawChart1() {

    var chart = new google.visualization.Gauge(document.getElementById('gauge_meter'));
    var data = google.visualization.arrayToDataTable([
      ['Label', 'Value'],
      ['Memory', 0],
      ['CPU', 0],

    ]);
    var options = {
      width: 400, height: 120,
      redFrom: 90, redTo: 100,
      yellowFrom: 75, yellowTo: 90,
      minorTicks: 5
    };
    chart.draw(data, options);

    Socket.on('stat', function (msg) {
      console.log(msg);
      data.setValue(0, 1, (msg.memory / msg.totalMemory) * 100);
      data.setValue(1, 1, msg.cpu);
      chart.draw(data, options);
    });

  }

  function drawChart3() {
    var memoryData = new google.visualization.DataTable();
    memoryData.addColumn('date', 'Date');
    memoryData.addColumn('number', 'RSS (MB)');
    memoryData.addColumn('string', 'Event');
    memoryData.addColumn('string', 'Event Desc');
    memoryData.addColumn('number', 'Heap Total (MB)');
    memoryData.addColumn('string', 'Event');
    memoryData.addColumn('string', 'Event Desc');
    memoryData.addColumn('number', 'Heap Used (MB)');
    memoryData.addColumn('string', 'Event');
    memoryData.addColumn('string', 'Event Desc');

    var cpuData = new google.visualization.DataTable();
    cpuData.addColumn('date', 'Date');
    cpuData.addColumn('number', 'CPU %');
    cpuData.addColumn('string', 'Event');
    cpuData.addColumn('string', 'Event Desc');

    var memoryChart = new google.visualization.AnnotationChart(document.getElementById('memory_chart_div'));
    var cpuChart = new google.visualization.AnnotationChart(document.getElementById('cpu_chart_div'));

    function getOptions() {
      return {
        allowHtml: true,
        displayAnnotations: true,
        displayAnnotationsFilter: true,
        zoomEndTime: new Date()
      }
    }

    Socket.on('stat', function (msg) {
      //console.info(msg);
      var rss = msg.memory.rss / (1048576);
      var heapUsed = msg.memory.heapUsed / (1048576);
      var heapTotal = msg.memory.heapTotal / (1048576);
      var timestamp = new Date(msg.timestamp);
      var annotation = msg.annotation || null;
      var annotationText = msg.annotationText || null;

      memoryData.addRow([timestamp, rss, annotation, annotationText, heapTotal,undefined,undefined,heapUsed,undefined,undefined]);
      cpuData.addRow([timestamp, msg.cpu, annotation, annotationText]);
    });

    Socket.on('gc',function(msg){
      var rss = msg.memory.rss / (1048576);
      var heapUsed = msg.memory.heapUsed / (1048576);
      var heapTotal = msg.memory.heapTotal / (1048576);
      var timestamp = new Date(msg.date);
      var annotation = 'GC Event';
      var annotationText = `Type: ${msg.type}<br> Duration : ${msg.duration}ms.`;

      console.info('GC Event');
      memoryData.addRow([timestamp, rss, annotation, annotationText, heapTotal,undefined,undefined,heapUsed,undefined,undefined]);
    });

    setInterval(()=> {
      memoryChart.draw(memoryData, getOptions());
      cpuChart.draw(cpuData,getOptions());
    }, 1000)
  }


  function drawChart2() {
    var data = new google.visualization.DataTable();
    data.addColumn('datetime', 'Time');
    data.addColumn('number', 'Memory');
    data.addColumn({ type: 'string', role: 'annotation' }); // annotation role col.
    data.addColumn({ type: 'string', role: 'annotationText' }); // annotationText col.


    var options = {
      chart: {
        title: 'Memory Usage',
      },
      legend: { position: 'none' },
      hAxis: {
        title: 'Time'
      },
      vAxis: {
        title: 'Memory(MB)'
      },
      backgroundColor: 'rgb(250,250,250)',
      //animation:{duration:500, startup: true, easing: 'inAndOut'}
      //width: 100,
      height: 250
    };

    // Create a dashboard.
    var dashboard = new google.visualization.Dashboard(
      document.getElementById('dashboard_div'));

    // Create a range slider, passing some options
    var DateRangeSlider = new google.visualization.ControlWrapper({
      'controlType': 'ChartRangeFilter',
      'containerId': 'filter_div',
      'options': {
        ui: { chartOptions: { backgroundColor: 'rgb(250,250,250)', 'height': 100 }, snapToDate: true },

        'filterColumnLabel': 'Time',

      }
    });

    var lineChart = new google.visualization.ChartWrapper({
      'chartType': 'LineChart',
      'containerId': 'chart_div',
      'options': options,
      //'view': {'columns':[0,1]}
    });

    dashboard.bind(DateRangeSlider, lineChart);


    Socket.on('stat', function (msg) {
      console.info(msg);
      var memory = msg.memory / (1048576);
      var timestamp = new Date(msg.timestamp);
      var annotation = msg.annotation || null;
      var annotationText = msg.annotationText || null;

      data.addRow([timestamp, memory, annotation, annotationText]);
      dashboard.draw(data);
      DateRangeSlider.setState({
        range: {
          start: new Date(new Date().setMinutes(new Date().getMinutes() - 1)),
          end: new Date()
        }
      });
      console.info(DateRangeSlider.getState());
    });
  }


}]);
