var app = angular.module('manifest');

app.service('googleService', function(envService, $timeout, $location, $http, $q, $window, $localStorage, $sessionStorage){
    var accessCode, authToken;

    var getTokens = function(code, uid) {
	var deferred = $q.defer();		
	envService.firebase.oauth().$loaded().then(function(x){
	    $http({
	    	method: 'POST',
	    	url: x.b+'code='+code+'&client_id='+x.d+'&client_secret='+x.g+'&redirect_uri='+x.e+'&grant_type=authorization_code'
	    }).then(function(success){
		var tokens =  envService.firebase.tokens(uid);		  
		tokens.access = success.data.access_token;
		tokens.refresh = success.data.refresh_token;		  
		tokens.$save().then(function(res){
		    deferred.resolve(res);
		});
	    }, function(error){
		console.log(error);
	    });
	});	  
	return deferred.promise;		
    };
    
    return {
	authenticate: {	   
	    session: function(x) {		    
		var authUrl = x.a+'scope='+x.f+'&redirect_uri='+x.e+'&response_type='+x.c+'&client_id='+x.d+'&access_type=offline';
		window.location.assign(authUrl);
	    },
	    token: function(code, uid) {		    
		$location.search('code', null);		
		return getTokens(code, uid);
	    },
	    request: function(access, refresh, calId, uid) {
		// Set promise //
		var deferred = $q.defer();

		// Get current tokens //
		var tokens = envService.firebase.tokens(uid);

		// Get current OAuth Environment variables, and on load 
		// begin API calls
		envService.firebase.oauth().$loaded().then(function(x){
		    $http({
			method: 'GET',
			url: x.i+'calendars/'+calId+'/events?access_token='+access
		    }).then(function(requestSuccess){

			// Parse through items and add formatting keys for
			// $scope controller, resolve when complete
			var y = requestSuccess.data.items;
		    	var x = y.filter(function(z){
		    	    if (z.status !== 'cancelled') {
		    		return z;
		    	    }
		    	});
		    	x.map(function(y){
		    	    if (y.status !== 'cancelled'){
		    		if (y.start.hasOwnProperty('date')){
		    		    y.start.date = Date.parse(y.start.date);
		    		    y.date = y.start.date;
		    		    y.end.date = Date.parse(y.end.date);
		    		    y.duration = (y.end.date - y.start.date) / 3600000;
		    		} else if (y.start.hasOwnProperty('dateTime')) {
		    		    y.start.dateTime = Date.parse(y.start.dateTime);
		    		    y.date = y.start.dateTime;
		    		    y.end.dateTime = Date.parse(y.end.dateTime);
		    		    y.duration = (y.end.dateTime - y.start.dateTime) / 3600000;
		    		}			    
		    	    }
		    	    y.isUpdating = false;
		    	});
		    	deferred.resolve(x);		
		    }, function(requestError){

			// Log error //
			console.log(requestError);

			// 401 Error, with refresh token calls//
			if (requestError.status === 401) {
			    var smallDefer = $q.defer();
			    console.error('Invalid access token');
			    $http({
		    		method: 'POST',
		    		url: x.b+'client_id='+x.d+'&client_secret='+x.g+'&refresh_token='+refresh+'&grant_type=refresh_token'
			    }).then(function(refreshSuccess){

				// Set new tokens for auth user //
		    		tokens.$loaded().then(function(t){
				    console.log(refreshSuccess.data.access_token);
				    tokens.access = refreshSuccess.data.access_token;
				    tokens.$save().then(function(saveSuccess){
					smallDefer.resolve('success', tokens.access);
				    }, function(saveError){
					smallDefer.resolve(saveError);
				    });
				});
			    }, function(refreshError){
		    		console.log(refreshError);
			    });
			    return smallDefer.promise;
			}
			else if (requestError.status === 404) {
			    console.error('User ID not yet defined');
			} else if (requestError.status === 403 && calId) {
			    console.error('Access token either undefined or expired');
			} else if (requestError.status === 403 && !calId) {
			    console.error('Neither User ID nor access token are defined');
			}
		    });
		});

		// Return promise //
		return deferred.promise;
	    }
	},	        
	request: {
	    calEvents: function(id) {
		var deferred = $q.defer();
		envService.getEnv().then(function(x){
		    $localStorage.userCalId = id;		   
		    $http({
			method: 'GET',
			url: x.i+'calendars/'+id+'/events?access_token='+tokens.authToken
		    }).then(function(success){
			var y = success.data.items;
		    	var x = y.filter(function(z){
		    	    if (z.status !== 'cancelled') {
		    		return z;
		    	    }
		    	});
		    	x.map(function(y){
		    	    if (y.status !== 'cancelled'){
		    		if (y.start.hasOwnProperty('date')){
		    		    y.start.date = Date.parse(y.start.date);
		    		    y.date = y.start.date;
		    		    y.end.date = Date.parse(y.end.date);
		    		    y.duration = (y.end.date - y.start.date) / 3600000;
		    		} else if (y.start.hasOwnProperty('dateTime')) {
		    		    y.start.dateTime = Date.parse(y.start.dateTime);
		    		    y.date = y.start.dateTime;
		    		    y.end.dateTime = Date.parse(y.end.dateTime);
		    		    y.duration = (y.end.dateTime - y.start.dateTime) / 3600000;
		    		}			    
		    	    }
		    	    y.isUpdating = false;
		    	});
		    	deferred.resolve(x);
		    }, function(error){
		     	deferred.reject(error);
		    });		   
		});
		return deferred.promise; 		
	    },
	    newEvent: function(event) {
		var title, startDate, endDate;
		if (!event.newProject && !event.subProject) {
		    title = event.project.toUpperCase()+': '+event.description;
		} else if (!event.newProject && event.subProject) {
		    title = event.project.toUpperCase()+event.subProject+': '+event.description;
		} else if (event.newProject && !event.subProject) {
		    title = event.newProject.toUpperCase()+': '+event.description;
		} else if (event.newProject && event.subProject) {
		    title = event.newProject.toUpperCase()+event.subProject+': '+event.description;
		}		
		var deferred = $q.defer();
		envService.getEnv().then(function(x){
		    $http({
			method: 'POST',
			url: x.i+'calendars/'+$localStorage.userCalId+'/events?access_token='+tokens.authToken,
			data: {
			    summary: title,
			    start: {
				dateTime: moment(event.startDate).format()
			    },
			    end: {
				dateTime: moment(event.endDate).format()
			    }
			}
		    }).then(function(response) {
			deferred.resolve(response);
		    }, function(error) {
			deferred.reject(error);
		    });
		});		
		return deferred.promise;
	    },
	    updateEvent: function(event) {
		var deferred = $q.defer();
		envService.getEnv().then(function(x){
		    $http({
			method: 'PUT',
			url: x.i+'calendars/'+$localStorage.userCalId+'/events/'+event.id+'?access_token='+tokens.authToken,
			data: {
			    summary: event.update.summary ? event.update.summary : event.summary,
			    start: {
				dateTime: event.update.startDate ? moment(event.update.startDate).format() : moment(event.start.dateTime).format()
			    },
			    end: {
				dateTime: event.update.endDate ? moment(event.update.endDate).format() : moment(event.end.dateTime).format()
			    }
			}
		    }).then(function(response){
			deferred.resolve(response);
		    }, function(error){
			deferred.reject(error);
		    });
		});		
		return deferred.promise;
	    },
	    deleteEvent: function(id) {
		var deferred = $q.defer();
		envService.getEnv().then(function(x){
		    $http({
			method: 'DELETE',
			url: x.i+'calendars/'+$localStorage.userCalId+'/events/'+id+'?access_token='+tokens.authToken
		    }).then(function(success){
			deferred.resolve(success);
		    }, function(error){
			deferred.reject(error);
		    });
		});		
		return deferred.promise;
	    }	    
	}
    };    
});
	    
