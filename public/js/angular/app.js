var tabooApp = angular.module('tabooApp', ['ngRoute','tabooControllers', 'tabooFilters']);

tabooApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'templates/home.html',
        controller: 'staticContent'
      }).
      when('/about', {
        templateUrl: 'templates/home.html',
        controller: 'staticContent'
      }).
	  when('/register', {
        templateUrl: 'templates/register.html',
        controller: 'staticContent'
      }).
	  when('/dashboard', {
        templateUrl: 'templates/dashboard.html',
        controller: 'dashboard'
      }).
	  when('/new-game', {
        templateUrl: 'templates/new-game.html',
        controller: 'newGame'
      }).
	  when('/play', {
        templateUrl: 'templates/play.html',
        controller: 'play'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);