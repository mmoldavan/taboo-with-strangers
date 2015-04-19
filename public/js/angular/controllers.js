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
	var currGame = "G724953213";
	//var currGame = "G123456789";
	$http.get('data/checkGameState.js').success(function(response) {
		// see if it's this player's turn
		$scope.gamestate = response;
		console.log(response);
		if ($scope.gamestate.awaiting == 'you') {
			$http.get('data/'+currGame+'.js').success(function(data) {
				$scope.game = data;
				$scope.clientInput = {};
				
				/** INITIALIZE CLUES **/
				if ($scope.game.turn_type == 'clue')
				{
					$scope.clues = [];	
					$scope.displayClues = [];
					// if we are playing the same card as last time, fetch it
					if ($scope.game.turn_previous.end == 'sameCard') {
						$http.get('data/C12345.js').success(function(cardData) {
							$scope.allCards =  [cardData];
							$scope.playedCards = [];
							$scope.currCard = 0;						
						})
					}
					else //otherwise get all new cards
						$scope.getCards();
					
					$scope.game.updateMessage = $scope.game.player2;
					switch($scope.game.turn_previous.end) {
						case 'guessed':
							$scope.game.updateMessage += " guessed correctly. Time for a new card!";
						case 'skipped':
							$scope.game.updateMessage += " requested to skip the current card. Time for a new card!"
						case 'sameCard':
							$scope.game.updateMessage += " was not able to guess the card during their turn. Guesses:";
						case 'endRound':
							$scope.game.udpateMessage = "Round " + $scope.game.current_round - 1 + "has ended. Round " + $scope.game.current_round + " begins.";	
					}
					$scope.game.updateMessageShow = 'yes';
					setTimeout(function() { angular.element('#dismiss-msg').trigger('click'); }, 7000);
				}
				/** INITIALIZE GUESSING **/
				else if ($scope.game.turn_type == 'guess')
				{
					$scope.guesses = [];
					$scope.displayGuesses = [];
					// get the card we are guessing against
					$http.get('data/'+data.card+'.js').success(function(cardData) {
						$scope.card = cardData;
					})
					
					// set the update message appropriately
					$scope.game.updateMessage = $scope.game.player2;
					switch($scope.game.turn_previous.end) {
						case 'skipped':
							$scope.game.updateMessage += " requested to skip the current card. You'll see clues for the new card."
						case 'sameCard':
							$scope.game.updateMessage += " has sent you new clues.";
						case 'endRound':
							$scope.game.udpateMessage = "Round " + $scope.game.current_round - 1 + "has ended. Round " + $scope.game.current_round + " begins.";	
					}
					$scope.game.updateMessageShow = 'yes';
					setTimeout(function() { angular.element('#dismiss-msg').trigger('click'); }, 7000);
				}
			});
		}
	})
	
	$scope.dismissUpdate = function() {
		$scope.game.updateMessageShow = 'no';	
	}
	
	$scope.initPostObject = function() {
		var sendData = {};
		sendData.user_input = {};
		sendData.user_id = "U1234567";
		sendData.timer = $scope.game.timer;
		sendData.score = $scope.game.score;
		return sendData;
	}
	
	$scope.endRound = function() {
		var s = $scope.initPostObject();
		s.user_input.responses = $scope.game.turn_type == 'clue' ? $scope.clues : $scope.guesses;
		s.user_input.end = "endRound";
		console.log('timer end. POST:'); //TODO: replace with real post
		console.log(s); 	
	}
	
	// **START: ClUE FUNCS**	
	$scope.addClue = function() {
		if ($scope.clientInput.clueText != '' && $scope.clientInput.clueText != null) {
			/***TODO: implement function for checking if it's taboo!**/
			$scope.displayClues.splice(0, 0, $scope.clientInput.clueText);
			$scope.clues.push($scope.clientInput.clueText);
			$scope.clientInput.clueText = '';
		}
		else {
			alert('Your clue has no text');	
		}
	
	}
	
	$scope.nextCard = function() {
		$scope.playedCards.push($scope.allCards[$scope.currCard].card_id);
	
		if ($scope.playedCards.length < $scope.allCards.length) {
			$scope.currCard++;
		}
		else {
			console.log($scope.playedCards); //TODO : $http.post('/', $scope.playedCards).success(function() { })
			$scope.getCards();	
		}
	}
	
	$scope.postClues = function() {
		var s = $scope.initPostObject();
		s.user_input.end =  'sameCard';
		//$http.post('/', $scope.playedCards).success(function(data, status, headers, config) {}); //post played cards, uncomment when live
		console.log(sendData);	//TODO:add in post	
	}
	
	$scope.getCards = function() {
		$http.get('data/fetchCards.js').success(function(data) {
			$scope.allCards = data;
			$scope.playedCards = [];
			$scope.currCard = 0;
		})	
	}
	// END: ClUE FUNCS
	
	// **START: GUESSING FUNCS**
	$scope.addGuess = function() {
		if ($scope.clientInput.guessText != '' && $scope.clientInput.guessText != null) {
			var mainWord = new RegExp($scope.card.main_word, "gi");
			var guess = $scope.clientInput.guessText.trim();
			$scope.guesses.push(guess);
			var test = mainWord.test(guess);
			if (test) {
				$scope.game.score++;
				$scope.postGuesses("guessed");
				alert("Correct!");
			}
			else {
				alert("incorrect!");
				$scope.displayGuesses.splice(0, 0, guess);
				$scope.clientInput.guessText = '';
			}		
		}
		else {
			alert("Your guess has no text");
		}
	}
	
	$scope.postGuesses = function(actionType) {
		var s = $scope.initPostObject();
		sendData.user_id.end = actionType;
		console.log(sendData); //TODO: replace with POST
	}
	// END: GUESSING FUNCS
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