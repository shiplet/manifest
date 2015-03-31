var app = angular.module('manifest');

app.controller('InfoController', function($scope, envService, googleService, $location, $localStorage, $sessionStorage){
    var ref = envService.firebase.auth();
    ref.onAuth(function(authData){
	var userData;
	var auth;
	$scope.companyName = $localStorage.companyName;
	$scope.hourlyRate = $localStorage.hourlyRate;	
	if (authData) {
	    userData = envService.firebase.tokens(authData.uid);
	    userData.$loaded().then(function(res){
		$scope.user.newCalendarId = res.userCalName;
	    });
	}
	
	
	$scope.submitUserData = function() {
	    $localStorage.userCalName = $scope.user.newCalendarId;
	    $localStorage.companyName = $scope.user.companyName;
	    $localStorage.hourlyRate = $scope.user.hourlyRate;
	    userData.$loaded().then(function(res){
		userData.userCalName = $scope.user.newCalendarId;
		userData.$save().then(function(res){
		    console.log('Saved');
		    $location.path('/manage-projects');
		});
	    });
	    
	};
	
    });    
});
