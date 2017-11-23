'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.ShowEvents',
  'myApp.version',
  'ui.bootstrap'
])
.constant('PageSize', 5)
.constant('ApiUrl', 'http://localhost:58824/api/values/')
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  $routeProvider.otherwise({redirectTo: '/ShowEvents'});
}]);
