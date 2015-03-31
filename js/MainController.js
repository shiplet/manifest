var app = angular.module('manifest');

app.controller('MainController', function($scope, envService, googleService, $location, $sessionStorage, $state, $firebaseObject){
    var ref = envService.firebase.auth();
    var envData = envService.firebase.oauth();

    ref.onAuth(function(authData){
	if (authData) {
	    console.log('Auth on load: ', authData.uid);
	    envService.firebase.tokens(authData.uid).$loaded().then(function(t){
		if (t) {
		    console.log('Returned token data for: ', t.$id);
		    if (t.access && t.refresh) {
			console.log('Tokens already exist, routing to /basic-info');
			$location.path('/basic-info');
		    } else {
			console.log('No tokens exist');
			if (!$location.search().code && (!$sessionStorage.loggedIn || $sessionStorage.loggedIn)){
			    console.log('No url parameters');
			    $sessionStorage.loggedIn = authData.uid;
			    envData.$loaded().then(function(data){
				console.log('Data loaded, transferring to Google');
				googleService.authenticate.session(data);
			    });
			} else if ($location.search().code) {
			    console.log('Code received, retrieving access tokens');
			    googleService.authenticate.token($location.search().code, authData.uid).then(function(state, res){
				if (state) {
				    $location.path('/basic-info');
				}
			    });
			}
		    }
		};
	    });
	} else {
	    $scope.showCreateUserFields = false;
	    $scope.showLoginFields = true;	    
	    console.log('User is logged out');
	}
    });

    $scope.createUser = function() {
	console.log('Hiding create user fields');
	$scope.showCreateUserFields = false;
	console.log('Showing login fields');
	ref.createUser({
	    email: $scope.newUser.email,
	    password: $scope.newUser.password
	}, function(error, userData){
	    if (error) {
		console.log('Error creating user: ', error);
		alert('That email address is already in use.');
		setTimeout(function(){
		    window.location.reload();
		}, 100);
	    } else {
		ref.authWithPassword({
		    email: $scope.newUser.email,
		    password: $scope.newUser.password
		}, function(error, authData){
		    if (error) {
			console.log('Login failed: ', error );
		    } else {
			console.log('Login succeeded');
		    }
		});
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
	    } else {
		console.log('Login succeeded: ', authData.provider);
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
	setTimeout(function(){
	    window.location.reload(true);
	}, 100);
    };  
});


