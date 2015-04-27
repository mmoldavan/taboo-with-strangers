// JavaScript Document
var tabooControllers = angular.module('tabooControllers', []);
//var tabooUser = { userid: "U083236785", username:"TestUser1", points: 0}; //to be put in cookie dynamically 

tabooControllers.controller('nav', ['$scope','$location', '$cookieStore', function($scope,$location,$cookieStore) {
	if ($cookieStore.get('tabooUser')  != null) { //we're logged in	
		$scope.loggedin = true;
	}
	else {
		$scope.loggedin = false;
	}	
	console.log($scope.loggedin);
	
	$scope.activeLink = function(linkLoc){
		if (linkLoc == '/home' && ($location.path() == '/home' || $location.path() == '/dashboard'))
			return true; 
		return linkLoc === $location.path();		
	}
	
	$scope.goHome = function() {
		if ($cookieStore.get('tabooUser') != null)
			window.location = '#/dashboard';	
		else
			window.location = '#/home';
	}
	$scope.logMeOut = function() {
		$cookieStore.put('tabooUser',null);
		$scope.loggedin = false;
		window.location = '#/home';	
	}
}])

tabooControllers.controller('register', ['$scope', '$http', '$cookieStore', function ($scope, $http, $cookieStore) {
	$scope.submitData = function() {
		var sendData = {};
		sendData.username = $scope.regForm.username;
		sendData.password = $scope.regForm.password;
		sendData.email = $scope.regForm.email;
		sendData.country = $scope.regForm.country;
		sendData.city = $scope.regForm.city;
		console.log(sendData);		
		$http.post('/user', sendData).success(function(data) { console.log(data)
			  	// set the cookie
				$cookieStore.put('tabooUser',{ userid: data.user_id, username: data.username});
				$scope.loggedin = true;
				window.location = '#/dashboard'
		
		}).error(function(data, status, headers, config) {
    		$scope.regError = data.error;
  		});
	}
}])

tabooControllers.controller('logUserIn', ['$scope', '$http', '$cookieStore', function ($scope, $http, $cookieStore) {
	if ($cookieStore.get('tabooUser')  != null) { //we're logged in	
		window.location = '#/dashboard';
	}
	$scope.lForm = {}; 
	$scope.submitData = function() {
		var sendData = {}
		console.log($scope.lForm);
		sendData.username = $scope.lForm.username;
		sendData.password = $scope.lForm.password;
		
		$http.post('/user/login', sendData).success(function(data) { 
				console.log(data)
			  	// set the cookie
				if (data.valid_user) {
					$cookieStore.put('tabooUser',{ userid: data.user_id, username: $scope.lForm.username});
					$scope.loggedin = true;
					console.log($cookieStore.get('tabooUser').userid);
					window.location = '#/dashboard'
				}
				else
					$scope.lForm.errorMessage = "Invalid username/password";
		
		}).error(function(data, status, headers, config) {
			
  		});	
	}
}])

tabooControllers.controller('leaderboard', ['$scope', '$http', '$cookieStore', function ($scope, $http, $cookieStore) {
	$http.get('/user').success(function(data) {
		$scope.allUsers = data.slice(0,10); //show top 10
	})
}])

tabooControllers.controller('dashboard', ['$scope', '$http', '$cookieStore', function ($scope, $http, $cookieStore) {
  	$scope.tabooUser = $cookieStore.get('tabooUser');
	$scope.loggedin = true;
	
	$scope.checkGames = function() {	
		$http.get('/user/'+$cookieStore.get('tabooUser').userid+'/games').success(function(data) {
			console.log(data);
			$scope.myGames = data.games;
			$scope.points = data.user_score;
		});
	}
	
	$scope.goTo = function (where) {
		clearInterval(repeatCheck);
		window.location = where;	
	}
	$scope.checkGames();
	var repeatCheck = setInterval($scope.checkGames, 7000); // check every 20 secs
	
}]);

tabooControllers.controller('newGame', ['$scope','$http', '$cookieStore', function($scope,$http,$cookieStore) {
	$http.get('/user/'+$cookieStore.get('tabooUser').userid+'/users').success(function(data) {
		$scope.users = data;
  	});
	
	$scope.newGame = function(whichPlayer) {
		var sendData = {};
		sendData.userid = $cookieStore.get('tabooUser').userid;
		sendData.opponent = whichPlayer;
		$http.post('/game/challenge', sendData).success(function(data) {
			window.location = '#/dashboard';
			console.log(sendData);
			console.log(data);
		})		
	}
	
	$scope.automatch = function() {
		$http.post('/game/automatch', { userid: $cookieStore.get('tabooUser').userid}).success(function(data) {
			if (data.awaiting == 'you')
				window.location = '#/play/'+data.game_id;
			else
				window.location = '#/dashboard';
		})	
	}
}])

tabooControllers.controller('monitor', ['$scope','$http', '$routeParams', '$cookieStore', function($scope,$http,$routeParams,$cookieStore) {
	$scope.checkGameStatus = function() {
		$http.get('/user/'+$cookieStore.get('tabooUser').userid+'/'+$routeParams.gameID).success(function(response) {
			if (response.state != 'complete' && response.awaiting == 'you') {
				clearInterval(repeatCheck);
				window.location = '#/play/' + $routeParams.gameID;
			}
			if (response.state == 'complete') {
				clearInterval(repeatCheck);
				window.location = '#/game-end/' + $routeParams.gameID;
			}
			console.log(response);
		})
	}
	
	$scope.checkGameStatus(); //run on init
	var repeatCheck = setInterval($scope.checkGameStatus, 7000); // check every 7 secs for demo purposes
}])

tabooControllers.controller('play', ['$scope','$http', '$routeParams', '$cookieStore', function($scope,$http,$routeParams,$cookieStore) {
	$http.get('/game/'+$routeParams.gameID+'/'+$cookieStore.get('tabooUser').userid).success(function(data) {
		$scope.game = data;
		if ($scope.game.awaiting != "you")
			window.location = '#/game-monitor'+$scope.game.game_id;
		$scope.clientInput = {};
		
		/** INITIALIZE CLUES **/
		if ($scope.game.turn_type == 'clue')
		{
			$scope.clues = [];	
			$scope.displayClues = [];
			$scope.allCards = [];
			$scope.game.updateMessageShow;
			// if we are playing the same card as last time, fetch it
			if ($scope.game.turn_previous.result == 'sameCard') {
					$scope.allCards = [$scope.game.card];
					$scope.currCard = 0;
			}
			else //otherwise get all new cards
				$scope.getCards();
			
			$scope.game.updateMessage = $scope.game.player2.username;
			switch($scope.game.turn_previous.result) {
				case 'guessed':
					$scope.game.updateMessage += " guessed correctly. Time for a new card!";
					break;
				case 'skipped':
					$scope.game.updateMessage += " requested to skip the current card. Time for a new card!";
					break;
				case 'sameCard':
					$scope.game.updateMessage += " was not able to guess the card during their turn. Guesses:";
					break;
				case 'endRound':
					$scope.game.udpateMessage = "Round " + $scope.game.current_round - 1 + "has ended. Round " + $scope.game.current_round + " begins.";
					break;
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
			$http.get('/card/'+data.card).success(function(cardData) {
				$scope.card = cardData;
			})
			
			// set the update message appropriately
			$scope.game.updateMessage = '';
			if ( $scope.game.turn_history.length > 1) {
				$scope.game.turn_history.pop();
				$scope.game.updateMessage = $scope.game.player2.username + " in their turn " + $scope.game.turn_history.join(", ").replace(/taboo/g, "taboo-ed") + ".";
				$scope.game.updateMessage += " Time for a new card.";
			}
			switch($scope.game.turn_previous.result) {
				case 'sameCard':
					$scope.game.updateMessage += " "+$scope.game.player2.username + " has sent you clues.";
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
		sendData.user_input.responses = $scope.game.turn_type == 'clue' ? $scope.clues : $scope.guesses;
		$scope.clues = []; //reset
		$scope.displayClues = [];
		$scope.guesses = [];
		$scope.displayGuesses = [];
		$scope.game.turn_previous.responses = [];
		sendData.user_input.result = whichResult;
		sendData.user_id = $cookieStore.get('tabooUser').userid;
		sendData.timer = $scope.game.timer;
		sendData.score = $scope.game.score;
		sendData.card = $scope.game.turn_type == 'clue' ? $scope.allCards[$scope.currCard].card_id : $scope.card;
		console.log(sendData);
		$http.post('/game/'+$scope.game.game_id, sendData).success(function(data) {});
	}
	
	$scope.endRound = function() {
		$scope.postObject("endRound");
		window.location = '#/game-monitor/'+$scope.game.game_id;
	}
	
	$scope.evalSubmit = function(thisEvent) {
		if (thisEvent.keyCode == 13) {
			thisEvent.preventDefault();
			if ($scope.game.turn_type == 'clue')
				angular.element('#clue-button').trigger('click');
			else
				angular.element('#guess-button').trigger('click');
		}			
	}
	
	// **START: ClUE FUNCS**	
	$scope.addClue = function() {
		if ($scope.clientInput.clueText != '' && $scope.clientInput.clueText != null) {
			var clueTextClean = $scope.clientInput.clueText.match(/[a-zA-Z0-9]+/gi, ""); //accept only letters or numbers as valid word input
			var cleanClueWord = clueTextClean.join(" "); //rejoin matches into one space-separated phrase
			console.log(cleanClueWord);
			var totalForbiddenWords = $scope.allCards[$scope.currCard].allForbiddenWords;
			for (k = 0; k < totalForbiddenWords.length; k++) {
				var patt = new RegExp(totalForbiddenWords[k].trim(), "gi");
				if (patt.test(cleanClueWord.toLowerCase())) {
						alert('Taboo Word! ' + totalForbiddenWords[k]);
						$scope.game.score--;
						$scope.nextCard('taboo');
						$scope.clientInput.clueText = '';
						return;
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
			var mainWord = new RegExp($scope.card.word, "gi");
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

tabooControllers.controller('endGame', ['$scope','$http', '$routeParams', '$cookieStore', function($scope,$http,$routeParams,$cookieStore) {
	$scope.clientInput = {};
	$http.get('/game/'+$routeParams.gameID+'/'+$cookieStore.get('tabooUser').userid).success(function(data) {
		$scope.game = data;
	})
	
	$scope.checkMessages = function() {
		$http.get('/messages/'+$routeParams.gameID+'/'+$cookieStore.get('tabooUser').userid).success(function(data) {
			$scope.messages = data.messages;
			for (i = 0; i < $scope.messages.length; i++) {
				var msg = $scope.messages[i];
				var thisDate = new Date(msg.created_at);
				var thisHour = thisDate.getHours();
				if (thisHour < 1 || thisHour > 12)
					thisHour = Math.abs(thisHour - 12);
				var thisMin = thisDate.getMinutes() < 10 ? '0'+thisDate.getMinutes() : thisDate.getMinutes();
				var ampm = thisDate.getHours() >= 12 ? "pm" : "am"; 
				var formatted =  thisDate.getMonth()+'/'+thisDate.getDate()+' @ '+thisHour+':'+thisMin+' '+ampm; 
				msg.time = formatted;	
			}
			console.log(data);
		})
	}
		
	$scope.sendMessage = function() {
		var sendData = {};
		sendData.user_id = $cookieStore.get('tabooUser').userid;
		sendData.text = $scope.clientInput.messageText;
		$http.post('/messages/'+$scope.game.game_id, sendData).success(function(data) {
			console.log(sendData);
			$scope.checkMessages();
		});	
		$scope.clientInput.messageText = '';	
		
	}
	
	$scope.toDashboard = function() {
		clearInterval(repeatMsgCheck);
		window.location = '#/dashboard';	
	}
	
	$scope.evalSubmit = function(thisEvent) {
		if (thisEvent.keyCode == 13) {
			thisEvent.preventDefault();
			$scope.sendMessage();
		}			
	}
	
	$scope.checkMessages();
	var repeatMsgCheck = setInterval($scope.checkMessages, 7000);
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