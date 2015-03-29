var app = angular.module('manifest');

app.controller('MainController', function($scope, envService, googleService, $location, $sessionStorage, $state, $firebaseObject){
    $scope.showCreateUserFields = true;
    var ref = envService.firebase.auth();
    ref.onAuth(function(authData){	
	if (authData) {	   
	    var tokens = envService.firebase.tokens(authData.uid);
	    tokens.$loaded().then(function(){		
		if (!tokens.access && !tokens.refresh && !$sessionStorage.loggedIn) {    
		    $sessionStorage.loggedIn = authData.uid;
		    envService.firebase.oauth().$loaded().then(function(envData){
		    	googleService.authenticate.session(envData);
		    });
		} else if (!tokens.access && !tokens.refresh && $sessionStorage.loggedIn) {
		    if ($location.search().code) {
			googleService.authenticate.token($location.search().code, authData.uid);
		    }
		} else if (tokens.access && tokens.refresh && $sessionStorage.loggedIn) {
		    $location.path('/manage-projects');
		}
	    });	    
	} else {
	    $scope.showCreateUserFields = true;
	    $scope.showLoginFields = false;	    
	    console.log('User is logged out');
	}
    });

    $scope.createUser = function() {
	ref.createUser({
	    email: $scope.newUser.email,
	    password: $scope.newUser.password
	}, function(error, userData){
	    if (error) {
		console.log('Error creating user: ', error);
	    } else {
		alert('You may now log in');
		$scope.showCreateUserFields = false;
		$scope.showLoginFields = true;
	    }
	});
    };

    $scope.login = function() {
	ref.authWithPassword({
	    email: $scope.login.email,
	    password: $scope.login.password
	}, function(error, authData){
	    if (error) {
		console.log('Login failed: ', error);
	    } 
	});
    };    

    $scope.showLogin = function() {
	$scope.showCreateUserFields = $scope.showCreateUserFields ? false : true;
	$scope.showLoginFields = !$scope.showLoginFields ? true : false;
    };

    $scope.unauth = function() {
	delete $sessionStorage.loggedIn;
	ref.unauth();
    };  
});


