var app = angular.module('manifest');

app.service('envService', function($window, $http, $firebaseArray, $firebaseObject){
    return {
	getEnv: function() {
	    return $http({
		method: 'GET',
		url: 'js/getEnv'
	    }).then(function(success){
		return success;
	    }, function(error){
		return error;
	    });
	},
	getFirebase: function() {
	    return $firebaseObject(new Firebase($window.env.firebase));
	}
	
    };
});
