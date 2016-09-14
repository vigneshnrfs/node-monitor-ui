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
app.controller('DashBoardController', ['db', '$window', 'google', function (db, $window, google) {

    this.paused = false;
    this.showGC = true;
    this.liveDuration = 30; //In secs

    this.togglePause = () => {
        this.paused = !this.paused
    };


    this.init = () => {
        console.debug('---> DashBoard Controller Init <----');
        var changes = db.changes({
            since: 'now',
            live: true,
            include_docs: true,
            filter: function (doc) {
                return !doc._deleted;
            }
        }).on('change', (change) => {

            //console.log('change ---->', change);

            if (change.doc.gc && this.showGC) {
                change.doc.heapAnnotation = `GC - ${change.doc.gc.type}`;
                change.doc.heapAnnotationText = change.doc.gc.type;
            }

            if (change.doc.event) {
                var event = change.doc.event;
                if (event.timeDelta) {
                    change.doc.annotation = `*${event.label} - End`;
                    change.doc.timestamp = event.endTime;
                    change.doc.annotationText = `Exec Time: ${event.timeDelta}`
                } else {
                    change.doc.timestamp = event.startTime;
                    change.doc.annotation = `*${event.label} - Start`;
                    if (event.desc) change.doc.annotationText = event.desc;
                }
            }

            this.updateDashboard(change.doc);
        }).on('error', function (err) {
            // handle errors
            console.error(err);
        });
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


    var dashboard = new google.visualization.Dashboard(
        document.getElementById('dashboard'));

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
        'view': {'columns': [0, 1, 2, 3, 4, 5,6,7]}
    });


    dashboard.bind(dateRangeSlider, [cpuChart, memoryChart]);


    this.updateDashboard = (info)=> {
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
            dashboard.draw(data)
        }

    };

    this.clearData = () => {
        data.removeRows(0, data.getNumberOfRows() - 1);
        dashboard.draw(data);
    };

    this.liveDurationChanged = () =>{
        dateRangeSlider.setState({
            range: {
                start: new Date(new Date().setSeconds(new Date().getSeconds() - this.liveDuration)),
                end: new Date()
            }
        });
    }

}]);