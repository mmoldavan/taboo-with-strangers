var tabooApp = angular.module('tabooApp', ['ngRoute','tabooControllers', 'tabooFilters', 'tabooDirectives']);

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
        templateUrl: 'templates/game-new.html',
        controller: 'newGame'
      }).
	  when('/game-monitor/:gameID', {
        templateUrl: 'templates/game-monitor.html',
        controller: 'monitor'
      }).
	  when('/play/:gameID', {
        templateUrl: 'templates/play.html',
        controller: 'play'
      }).
	  when('/game-end/:gameID', {
        templateUrl: 'templates/game-end.html',
        controller: 'endGame'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);