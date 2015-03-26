var app = angular.module('manifest');

app.service('googleService', function(envService, $timeout, $location, $http, $q, $window, $localStorage, $sessionStorage){
    var accessCode, authToken;

    var tokens = $sessionStorage.$default();

    var getToken = function(token) {
	if (token === $location.absUrl()) {
	    console.warn('Not authenticated');
	} else {
	    envService.getEnv().then(function(x){
		var deferred = $q.defer();		
		$http({
	    	    method: 'POST',
	    	    url: x.b+'code='+token+'&client_id='+x.d+'&client_secret='+x.g+'&redirect_uri='+x.e+'&grant_type=authorization_code'
	    	}).then(function(success){
	    	    tokens.authToken = success.data.access_token;
		    $sessionStorage.loggedIn = true;
	    	    $location.path('/manage-projects');
	    	}, function(error){
	    	    if (error.status === 400) {
	    		console.error('This session has not authenticated yet.');
	    	    }
	    	});
	    	return deferred.promise;		
	    });	  
	}
    };
    
    return {
	authenticate: {
	    mobile: {
		session: function() {
		    envService.getEnv().then(function(x){
			var authUrl = x.a+'scope='+x.f+'&redirect_uri='+x.e+'&response_type='+x.c+'&client_id='+x.d;
			window.location.assign(authUrl);
		    });		    		    
		},
		token: function() {		    
		    var url = $location.absUrl(),
			start = url.indexOf('=') + 1,
			end, token;
		    if (url.indexOf('#') !== -1) {
			end = url.indexOf('#');
			token = url.slice(start, end);
		    } else {
			token = url.slice(start);
		    }
		    $location.search('code', null);
		    getToken(token);
		}
	    },
	    load: function() {
		var holdForAuth = $q.defer();
		if (!$localStorage.userCalId) {
		    holdForAuth.resolve('No user calendars specified');
		} else {		    
		    holdForAuth.resolve('cal');
		}
		return holdForAuth.promise;
	    },
	    session: function() {
		var holdForAuth = $q.defer();
		var top = (screen.height / 2) - 200;
		var left = (screen.width / 2) - 300;
		var win = window.open(authUrl, 'AuthWindow', 'width=600, height=400, top='+top+', left='+left);
		var pollTimer = setInterval(function(){
		    try {
			if (win.document.URL) {
			    window.clearInterval(pollTimer);
			    var url = win.document.URL,
				start = url.indexOf('=') + 1,
				end, token;
			    if (url.indexOf('#') !== -1) {
				end = url.indexOf('#');
				token = url.slice(start, end);
			    } else {
				token = url.slice(start);
			    }				
			    getToken(token);
			    win.close();
			}
		    } catch(e){}
		}, 50);
		var authTimer = setInterval(function(){
		    try {
			if ($sessionStorage.authToken) {
			    window.clearInterval(authTimer);
			    holdForAuth.resolve('Session authorized');
			}
		    } catch(e){}
		}, 100);
		return holdForAuth.promise;
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
	    
