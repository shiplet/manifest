var app = angular.module('manifest');

app.controller('MainController', function($scope, envService, googleService, $location, $sessionStorage, $state, $firebaseObject){
    $scope.showCreateUserFields = true;
    $scope.showLoginFields = false;
    var ref = envService.firebase.auth();
    var envData = envService.firebase.oauth();
    var tokens = envService.firebase.tokens();

    ref.onAuth(function(authData){
	if (authData) {
	    console.log('Auth on load: ', authData.uid);
	    if (!$location.search().code && !$sessionStorage.loggedIn){
		$sessionStorage.loggedIn = authData.uid;
		envData.$loaded().then(function(data){
		    console.log('Data loaded, transferring to Google');
		    googleService.authenticate.session(data);
		});
	    } else if ($location.search().code) {
		console.log('Code received, retrieving access tokens');
		googleService.authenticate.token($location.search().code, authData.uid).then(function(state, res){
		    if (state) {
			$location.path('/manage-projects');
		    }
		});
	    } 
	} else {
	    $scope.showCreateUserFields = true;
	    $scope.showLoginFields = false;	    
	    console.log('User is logged out');
	}
    });

    $scope.createUser = function() {
	console.log('Hiding create user fields');
	$scope.showCreateUserFields = false;
	console.log('Showing login fields');
	$scope.showLoginFields = true;
	ref.createUser({
	    email: $scope.newUser.email,
	    password: $scope.newUser.password
	}, function(error, userData){
	    if (error) {
		console.log('Error creating user: ', error);
	    } else {
		console.log('Successful user creation: ', userData);		
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
		console.log('Login succeeded: ', authData);
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


