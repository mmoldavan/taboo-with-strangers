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
		$scope.game.timer = data.timer;
		$scope.playedCards = [];
		$scope.currCard = 0;
		
		if ($scope.game.turnType == 'clue')
		{
			$scope.getCards();
		}		
  	});
	
	$scope.clues = [];
	$scope.clientInput = {};
	
	$scope.addClue = function() {
		var len = $scope.clues.length;
		if ($scope.clientInput.clueText != '') {
			/***TODO: implement function for checking if it's taboo!**/
			len++;
			var thisClue = new Object();
			thisClue.num = len;
			thisClue.text = $scope.clientInput.clueText;
			$scope.clues.push(thisClue);
			$scope.clientInput.clueText = '';
		}	
	}
	
	$scope.nextCard = function() {
		$scope.playedCards.push($scope.allCards[$scope.currCard].card_id);
		console.log($scope.playedCards);		
		if ($scope.playedCards.length < $scope.allCards.length) {
			$scope.currCard++;
		}
		else {
			//TODO: add in post of played cards
			$scope.playedCards = [];
			$scope.currCard = 0;
			$scope.getCards();	
		}
	}
	
	$scope.submitClues = function() {
		var sendData = new Object();
		sendData.timer = $scope.game.timer;
		sendData.clues = $scope.clues;
		sendData.usedCards = $scope.playedCards;
		console.log(sendData);	//TODO:add in post	
	}
	
	$scope.endRound = function() {
		console.log('timer end');	
	}
	
	$scope.getCards = function() {
		$http.get('data/fetchCards.js').success(function(data) {
			$scope.allCards = data;
		})	
	}
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
																		 
/*******FILTERS******/
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

/****DIRECTIVES****/
var tabooDirectives = angular.module('tabooDirectives', []);

// adapted from https://docs.angularjs.org/api/ng/service/$interval
tabooDirectives.directive('roundTimer', ['$interval', function($interval) {
        return function(scope, element, attrs) {
			var stopTime; // so that we can cancel the time updates

			// used to update the UI
			function updateTime() {
				if (scope.game) {	
					if ((scope.game).timer > 0) {
						element.text((scope.game).timer -= 1);
					}
					else {
						console.log('end inside timer');
						$interval.cancel(stopTime);
						scope.endRound();
					}
				}
			}

			// watch the expression, and update the UI on change.
			scope.$watch(attrs.roundTimer, function(value) {
				updateTime();
			});
			
			stopTime = $interval(updateTime, 1000);
			
			// listen on DOM destroy (removal) event, and cancel the next UI update
			// to prevent updating time after the DOM element was removed.
			element.on('$destroy', function() {
				$interval.cancel(stopTime);
			});
        }
}]);								