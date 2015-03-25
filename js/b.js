var app = angular.module('manifest');

app.service('envService', function($window, $q, $http){
    return {
	getEnv: function() {
	    var deferred = $q.defer();
	    $http({
		method: 'GET',
		url: './js/e.json'
	    }).then(function(success){
		deferred.resolve(success.data);
	    }, function(error){
		deferred.reject(error);
	    });
	    return deferred.promise;
	}
    };
});
