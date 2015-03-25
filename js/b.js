var app = angular.module('manifest');

app.service('envService', function($window, $http, $firebaseArray, $firebaseObject, $q){
    return {
	getEnv: function() {
	    return $http({
		method: 'GET',
		url: 'js/getEnv'
	    }).then(function(success){
		return success.data;
	    }, function(error){
		return error;
	    });
	}
    };
});
