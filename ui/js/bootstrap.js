/**
 * Created by vignesh on 12/09/16.
 */

"use strict";

(function (document) {

  //Load Google Charts
  google.charts.load('current', { 'packages': ['gauge', 'corechart', 'controls', 'annotationchart'] });
  google.charts.setOnLoadCallback(chartLoaded);

  function chartLoaded(){
    var db = new PouchDB('logs');
    db.destroy().then(()=>{
      angular.element(document).ready(function() {
        console.debug('PRE EXEC DONE.. Bootstrapping Angular...');
        angular.bootstrap(document, ['myApp']);
      });
    });
  }



})(document);