var app = angular.module('manifest');

app.service('googleService', function(envService, $timeout, $location, $http, $q, $window, $localStorage, $sessionStorage){    
    var getTokens = function(code, uid) {
	var deferred = $q.defer();		
	envService.firebase.oauth().$loaded().then(function(x){
	    console.log('Making http request');
	    $http({
	    	method: 'POST',
	    	url: x.b+'code='+code+'&client_id='+x.d+'&client_secret='+x.g+'&redirect_uri='+x.e+'&grant_type=authorization_code'
	    }).then(function(success){
		console.log('Successful API call, now saving tokens');
		var tokens =  envService.firebase.tokens(uid);
		if (!success.data.refresh_token) {
		    alert('If you\'re getting this error, chances are you revoked Manifest\'s permission to access your calendar. Please review your Google App permissions.');
		    $location.path('/');
		} else {
		    tokens.access = success.data.access_token;
		    tokens.refresh = success.data.refresh_token;
		    tokens.$save().then(function(res){
			deferred.resolve('Success', res);
		    });
		}				
	    }, function(error){
		console.error('Error while saving tokens: ', error);
		deferred.resolve(null, error);
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
		var deferred = $q.defer();
		console.log('Successful code parse');
		$location.search('code', null);		
		deferred.resolve(getTokens(code, uid));
		return deferred.promise;
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
			    console.error('Invalid access token');
			    return $http({
		    		method: 'POST',
		    		url: x.b+'client_id='+x.d+'&client_secret='+x.g+'&refresh_token='+refresh+'&grant_type=refresh_token'
			    }).then(function(refreshSuccess){
				
				// Set new tokens for auth user //
		    		tokens.$loaded().then(function(t){
				    tokens.access = refreshSuccess.data.access_token;
				    tokens.$save();
				    tokens.$loaded().then(function(){
					console.log('New tokens loaded');
					setTimeout(function(){
					    window.location.reload(true);
					}, 100);
				    });
				});
			    }, function(refreshError){
		    		console.error(refreshError.data.error_description);
				if (refreshError.data.error_description === 'Token has been revoked.') {
				    alert('You must\'ve revoked Manifest\'s access to your Google Calendar. You\'ll need to reauthenticate before proceeding.');
				    tokens.$remove().then(function(res){
					console.log(res);
					$location.path('/');
				    });
				    
				}
			    });
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
	    newEvent: function(event, uid) {
		var title, startDate, endDate,
		    tokens = envService.firebase.tokens(uid);
		console.log('Parsing event characteristics');
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
		console.log('Making API call to POST data');
		envService.firebase.oauth().$loaded().then(function(x){
		    $http({
			method: 'POST',
			url: x.i+'calendars/'+$localStorage.userCalId+'/events?access_token='+tokens.access,
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
	    updateEvent: function(event, uid) {
		console.log('Updating event');
		var deferred = $q.defer();
		var tokens = envService.firebase.tokens(uid);
		console.log('Making API call');
		envService.firebase.oauth().$loaded().then(function(x){
		    $http({
			method: 'PUT',
			url: x.i+'calendars/'+$localStorage.userCalId+'/events/'+event.id+'?access_token='+tokens.access,
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
			console.log('Event updated');
			deferred.resolve(response);
		    }, function(error){
			console.log('Error in update');
			deferred.reject(error);
		    });
		});		
		return deferred.promise;
	    },
	    deleteEvent: function(id, uid) {
		console.log('Deleting specified event');
		var deferred = $q.defer();
		var tokens = envService.firebase.tokens(uid);
		console.log('Making API call');
		envService.firebase.oauth().$loaded().then(function(x){
		    $http({
			method: 'DELETE',
			url: x.i+'calendars/'+$localStorage.userCalId+'/events/'+id+'?access_token='+tokens.access
		    }).then(function(success){
			console.log('Event deleted');
			deferred.resolve(success);
		    }, function(error){
			console.log('Error in deleting event');
			deferred.reject(error);
		    });
		});		
		return deferred.promise;
	    }	    
	}
    };    
});
	    
