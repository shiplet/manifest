var app = angular.module('manifest');

app.service('envService', function($window){
    return {
	getEnv: function() {
	    return $window.env;
	}
    };
});
