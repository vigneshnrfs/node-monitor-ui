/**
 * Created by vignesh on 12/09/16.
 */

var myApp = angular.module('myApp');

myApp.config(function($stateProvider,$urlRouterProvider) {
  var dashboardState = {
    name: 'dashboard',
    url: '/dashboard',
    templateUrl: '/ui/views/dashboard.html'
  };

  var logStreamState = {
    name: 'logstream',
    url: '/log-stream',
    templateUrl: '/ui/views/log-streams.html'
  };

  $stateProvider.state(dashboardState);
  $stateProvider.state(logStreamState);
  $urlRouterProvider.otherwise('/dashboard');
});