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


  $stateProvider.state(dashboardState);
  $urlRouterProvider.otherwise('/dashboard');
});