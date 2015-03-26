var app = angular.module('manifest');

/// Main Controller ///

app.controller('MainController', function($rootScope, $scope, envService, googleService, $location, $sessionStorage, $state){
    $scope.authenticate = function() {
	if (!$sessionStorage.authToken) {
	    googleService.authenticate.mobile.session();
	} else if ($sessionStorage.authToken) {
	    $location.path('/manage-projects');
	}
    };

    (function() {
	if (!$sessionStorage.authToken) {	    
	    googleService.authenticate.mobile.token();
	} else if ($sessionStorage.authToken) {
	    $location.path('/manage-projects');
	}
    })();


});


