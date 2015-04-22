// JavaScript Document
var tabooControllers = angular.module('tabooControllers', []);
var tabooUser = { userid: "U083236785", username:"TestUser1", points: 0}; //to be put in cookie dynamically 

tabooControllers.controller('staticContent', ['$scope','$location', function($scope,$location) {
	$scope.activeLink = function(linkLoc){
		return linkLoc === $location.path();		
	}
}])

tabooControllers.controller('dashboard', ['$scope', '$http', function ($scope, $http) {
  	$http.get('/user/'+tabooUser.userid+'/games').success(function(data) {
		$scope.myGames = data;
		$scope.tabooUser = tabooUser;
  	});
}]);

tabooControllers.controller('newGame', ['$scope','$http', function($scope,$http) {
	$http.get('/user/'+tabooUser.userid+'/users').success(function(data) {
		$scope.users = data;
  	});
	
	$scope.newGame = function(whichPlayer) {
		var sendData = {};
		sendData.userid = tabooUser.userid;
		sendData.opponent = whichPlayer;
		$http.post('/game/challenge', sendData).success(function(data) {
			window.location = '#/dashboard';
			console.log(sendData);
			console.log(data);
		})		
	}
	
	$scope.automatch = function() {
		$http.post('/game/automatch', { userid: tabooUser.userid}).success(function(data) {
			window.location = '#/play/'+data.game_id+'/'+tabooUser.userid;
		})	
	}
}])

tabooControllers.controller('monitor', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
	$scope.checkGameStatus = function() {
		$http.get('data/checkGameState.js').success(function(response) {
			if (response.state != 'complete' && response.awaiting == 'you') {
				clearInterval(repeatCheck);
				window.location = '#/play/' + $routeParams.gameID;
			}
			if (response.state == 'complete') {
				clearInterval(repeatCheck);
				window.location = '#/end-game/' + $routeParams.gameID;
			}
			console.log(response);
		})
	}
	
	var repeatCheck = setInterval($scope.checkGameStatus, 20000); // check every 20 secs
}])

tabooControllers.controller('play', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
	$http.get('/game/'+$routeParams.gameID+'/'+tabooUser.userid).success(function(data) {
		$scope.game = data;
		$scope.clientInput = {};
		
		/** INITIALIZE CLUES **/
		if ($scope.game.turn_type == 'clue')
		{
			$scope.clues = [];	
			$scope.displayClues = [];
			$scope.game.updateMessageShow;
			// if we are playing the same card as last time, fetch it
			if ($scope.game.turn_previous.end == 'sameCard') {
				$http.get('/card/'+data.card).success(function(cardData) {
					$scope.allCards =  [cardData];
					$scope.currCard = 0;						
				})
			}
			else //otherwise get all new cards
				$scope.getCards();
			
			$scope.game.updateMessage = $scope.game.player2;
			switch($scope.game.turn_previous.result) {
				case 'guessed':
					$scope.game.updateMessage += " guessed correctly. Time for a new card!";
				case 'skipped':
					$scope.game.updateMessage += " requested to skip the current card. Time for a new card!"
				case 'sameCard':
					$scope.game.updateMessage += " was not able to guess the card during their turn. Guesses:";
				case 'endRound':
					$scope.game.udpateMessage = "Round " + $scope.game.current_round - 1 + "has ended. Round " + $scope.game.current_round + " begins.";	
			}
			//it might be the first round of the game
			if ($scope.game.turn_previous.result != null) {
				$scope.game.updateMessageShow = 'yes';
				setTimeout(function() { angular.element('#dismiss-msg').trigger('click'); }, 7000);
			}
			else {
				$scope.game.updateMessageShow = 'no';	
			}
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
			if ( $scope.game.turn_history.length > 1)
				$scope.game.updateMessage = $scope.game.player2.username + " in their turn " + $scope.game.turn_history.pop().toString().replace("taboo", "taboo-ed") + ".\n";
			switch($scope.game.turn_previous.result) {
				case 'sameCard':
					$scope.game.updateMessage += $scope.game.player2.username + " has sent you clues. for the same card you were playing.";
				case 'endRound':
					$scope.game.udpateMessage += "Round " + $scope.game.current_round - 1 + "has ended. Round " + $scope.game.current_round + " begins.";
			}
			$scope.game.updateMessageShow = 'yes';
			setTimeout(function() { angular.element('#dismiss-msg').trigger('click'); }, 7000);
		}
	});
	
	$scope.dismissUpdate = function() {
		$scope.game.updateMessageShow = 'no';	
	}
	
	$scope.postObject = function(whichResult) {
		var sendData = {};
		sendData.user_input = {};
		s.user_input.responses = $scope.game.turn_type == 'clue' ? $scope.clues : $scope.guesses;
		$scope.clues = []; //reset
		$scope.guesses = [];
		s.user_input.result = whichResult;
		sendData.user_id = tabooUser.userid;
		sendData.timer = $scope.game.timer;
		sendData.score = $scope.game.score;
		sendData.card = $scope.allCards[currCard].card_id;
		$http.post('/game/'+$scope.game.game_id, sendData).success(function(data) {});
	}
	
	$scope.endRound = function() {
		$scope.postObject("endRound");
		window.location = '#/game-monitor/'+$scope.game.game_id+'/'+tabooUser.userid;
	}
	
	// **START: ClUE FUNCS**	
	$scope.addClue = function() {
		if ($scope.clientInput.clueText != '' && $scope.clientInput.clueText != null) {
			var clueTextClean = $scope.clientInput.clueText.match(/[a-zA-Z0-9]+/gi, ""); //accept only letters or numbers as valid word input
			console.log(clueTextClean);
			for (i = 0; i < clueTextClean.length; i++) {
				currClue = clueTextClean[i];
					for (j = 0; j < allCards[currCard].allForbiddenWords.length; j++) {
						var patt = new RegExp(allCards[currCard].allForbiddenWords[j].toLowerCase(), "gi");
						if (patt.test(currClue.toLowerCase())) {
								alert('Taboo word!');
								$scope.game.score--;
								$scope.nextCard('taboo');
						}
					}
			}
			// it passes so add it to the clue array
			$scope.displayClues.splice(0, 0, $scope.clientInput.clueText);
			$scope.clues.push($scope.clientInput.clueText);
			$scope.clientInput.clueText = '';
		}
		else {
			alert('Your clue has no text');	
		}
	
	}
	
	$scope.nextCard = function(why) {	
		$scope.postObject(why);
		if ($scope.currCard.length < $scope.allCards.length) {
			$scope.currCard++;
		}
		else {
			$scope.getCards();
		}
	}
	
	$scope.postClues = function() {
		$scope.postObject("sameCard");
		window.location = '#/game-monitor/'+$scope.game.game_id;
	}
	
	$scope.getCards = function() {
		$http.get('/game/'+$routeParams.gameID+'/nextcards').success(function(data) {
			$scope.allCards = data.cards;
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
		$scope.postObject(actionType);
		window.location = '#/game-monitor/'+$scope.game.game_id;
	}
	// END: GUESSING FUNCS
}])

tabooControllers.controller('endGame', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
	$scope.clientInput = {};
	$http.get('data/'+$routeParams.gameID+'.js').success(function(data) {
		$scope.game = data;
	})
	
	$scope.checkMessages = function() {
		$http.get('data/messages.js').success(function(data) { //TODO: update with gameid for real call
			$scope.messages = data;
			console.log(data);
		})
	}
		
	$scope.sendMessage = function() {
		var sendData = {};
		sendData.user = "U1234567"; //TODO: replace with dynamic current user
		sendData.text = $scope.clientInput.messageText;
		console.log(sendData); //TODO: replace with actual POST, and request messages again on success of post, to get message user just wrote
	}
	
	$scope.toDashboard = function() {
		clearInterval(repeatMsgCheck);
		window.location = '#/dashboard';	
	}
	
	$scope.checkMessages();
	var repeatMsgCheck = setInterval($scope.checkMessages, 20000);
}])
																		 
/*******FILTERS******/
var tabooFilters = angular.module('tabooFilters', []).filter('gameSort', function() {
	return function(input) {
		return input.state == 'unaccepted';
	};
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