// JavaScript Document
var tabooControllers = angular.module('tabooControllers', []);

tabooControllers.controller('dashboard', ['$scope', '$http', function ($scope, $http) {
  	$http.get('data/games.js').success(function(data) {
		$scope.myGames = data;
  	});
}]);

tabooControllers.controller('newGame', ['$scope','$http', function($scope,$http) {
	$http.get('data/users.js').success(function(data) {
		$scope.users = data;
  	});
}])

tabooControllers.controller('play', ['$scope','$http', function($scope,$http) {
	$http.get('data/G724953213.js').success(function(data) {
		$scope.game = data;
		($scope.game).timer = data.timer;
		$scope.playedCards = [];
		
		if (($scope.game).turnType == 'clue')
		{
			$http.get('data/fetchCards.js').success(function(data) {
				$scope.allCards = data;
				$scope.activeCard = data[0];
	 		})
		}
  	});
}])

tabooControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
	$http.get('phones/' + $routeParams.phoneId + '.js').success(function(data) {
		$scope.phone = data;
		$scope.mainImageUrl = data.images[0];
	 })
	$scope.setImage = function(imageUrl) {
		$scope.mainImageUrl = imageUrl;
		$('body').fadeOut().fadeIn();
	}
}]);

tabooControllers.controller('staticContent', ['$scope','$location', function($scope,$location) {
	$scope.activeLink = function(linkLoc){
		return linkLoc === $location.path();		
	}
}])
																		 

var tabooFilters = angular.module('tabooFilters', []).filter('gameSort', function() {
	return function(input) {
		return input.state == 'unaccepted';
	};
});

tabooFilters.filter('checkmarkColor', function() {
	return function(input) {
		return input ? 'green' : 'red'
	}
});
											