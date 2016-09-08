'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ui.tinymce',
  'ngCookies',
  'message.flash'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/:url', {
    templateUrl: 'partials/page.html',
    controller: 'PageCtrl'
  });
  $routeProvider.otherwise({redirectTo: '/home'});
  $locationProvider.html5Mode(true);
}])
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('myHttpInterceptor');
});
