var app = angular.module('manifest');

app.controller('ProjectController', function($rootScope, $scope, envService, googleService, $location, $sessionStorage, $localStorage, $q, $interval, invoiceService) {    
    $scope.centerLogContainer = true;
    $scope.showCrudFields = false;
    $scope.showOverlay = false;
    $scope.logOutPop = false;
    $scope.deletePop = false;    
    $scope.showLogFields = false;
    $scope.notUpdating = true;
    $scope.updating = false;
    $scope.showInvoiceFields = false;
    $scope.showChangeCompany = false;
    $scope.userId = $localStorage.userCalId ? $localStorage.userCalId : null;
    $scope.companyName = $localStorage.companyName ? $localStorage.companyName : null;
    $scope.hourlyRate = $localStorage.hourlyRate ? $localStorage.hourlyRate : null;
    $rootScope.userId = $localStorage.userCalName || null;
    $scope.times = envService.getTimes();
    $scope.newEvent = $sessionStorage.savedEvent ? $sessionStorage.savedEvent : {};
    $sessionStorage.savedEvent = $scope.newEvent ? null : $sessionStorage.savedEvent;
    var ref = envService.firebase.auth();
    var userAuthData = ref.getAuth(),
	tokens = envService.firebase.tokens(userAuthData.uid),
	eventId;	

    var loadCalScreen = function(data) {	
	$scope.events = data;
	$scope.parseProjects(data);
    };
    
    $rootScope.$watch('userId', function(newValue, oldValue){
	console.log('Old value: ', oldValue);
	console.log('New value: ', newValue);
	$localStorage.userCalName = newValue;
	ref.onAuth(function(authData){
	    if (authData) {
	    tokens.$loaded().then(function(){
		if (tokens.userCalId){
		    googleService.authenticate.request(tokens.access, tokens.refresh, tokens.userCalId, authData.uid).then(function(res){
			console.log('From status newValue === tokens.userCalName: ', res);
			$localStorage.userCalId = tokens.userCalId;
			$scope.events = res;
			$scope.parseProjects(res);
		    });
		} else {
		    googleService.request.calendar(newValue, authData.uid, tokens.access).then(function(res){
			console.log('Response from ProjectController: ', res);
			if (res.status === 404) {
			    googleService.request.newCalendar(newValue, tokens.access).then(function(res){
				console.log(res);
				$localStorage.userCalId = res.data.id;
				tokens.userCalId = res.data.id;			    
				tokens.$save();
			    });
			} else if (res.status === 200){
			    googleService.authenticate.request(tokens.access, tokens.refresh, tokens.userCalId, authData.uid).then(function(res){
				console.log('From status 200: ', res);
				$scope.events = res;
				$scope.parseProjects(res);
			    });
			} else if (res.status === 401) {
			    googleService.authenticate.request(tokens.access, tokens.refresh, tokens.userCalId, authData.uid).then(function(res){
				console.log('Expired token refreshed: ', res);
			    });
			}
		    });    
		};		
	    });
	    }
	});		   
    });
    
    
    $scope.requestEvents = function(id) {
	console.log('Requested id: ', id);
	id = id || $scope.user.calendarId;
	$rootScope.userId = id || $localStorage.userCalId;
    };
    
    $scope.refreshEvents = function(id) {
	id = id || $localStorage.userCalId;
	googleService.authenticate.request(tokens.access, tokens.refresh, $localStorage.userCalId, userAuthData.uid).then(function(res){ 
	    console.log('Events refreshed');
	    loadCalScreen(res);
	});
    };

    $scope.parseProjects = function(data) {	
	$sessionStorage.clients = [];
	$sessionStorage.projects = [];
	var x = data.filter(function(y) {
	    if (y.summary.indexOf('|||') !== -1) {
		return y;
	    }
	});
	x.map(function(z) {
	    var a = z.summary.split('|||').slice(0, 1).toString().replace(' ', '').split(':');	 
	    if ($sessionStorage.clients.indexOf(a[0]) === -1) {
	    	$sessionStorage.clients.push(a[0]);
	    }
	    if ($sessionStorage.projects.indexOf(a[1]) === -1) {
	    	$sessionStorage.projects.push(a[1]);
	    }
	});
	$scope.clients = $sessionStorage.clients;
	$scope.projects = $sessionStorage.projects;
    };

    $scope.submitNewEvent = function() {
	googleService.request.newEvent($scope.newEvent, userAuthData.uid).then(function(response){
	    console.log('Response from Google: ', response);
	    if (response.status === 401) {
		$sessionStorage.savedEvent = $scope.newEvent;
		googleService.authenticate.request(tokens.access, tokens.refresh, tokens.userCalId, userAuthData.uid).then(function(res){
		    console.log('Expired token refreshed: ', res);
		});
	    }
	    $scope.newEvent = {};
	    $scope.refreshEvents();
	});
    };

    $scope.sendClient = function(client) {
	!$scope.newEvent ? $scope.newEvent = {} : $scope.newEvent.project = client;
	$scope.newEvent.project = client;
    };

    $scope.sendProject = function(project) {
	!$scope.newEvent ? $scope.newEvent = {} : $scope.newEvent.subProject = project;
	$scope.newEvent.subProject = project;
    };    

    $scope.submitUpdate = function(event) {
	googleService.request.updateEvent(event, userAuthData.uid).then(function(){
	    $scope.refreshEvents();
	});
    };

    $scope.updateEvent = function(event) {
	!event.isUpdating ? event.isUpdating = true : event.isUpdating = false;
    };

    $scope.submitNewInvoice = function() {
	$scope.invoiceProjects = envService.getInvoice($scope.newInvoice, $scope.events);
	invoiceService.createInvoice($scope.invoiceProjects);
    };

    $scope.exit = function() {
	$scope.showOverlay = true;
	$scope.logOutPop = true;
    };

    $scope.deleteCheck = function(id) {
	$scope.showOverlay = true;
	$scope.deletePop = true;
	eventId = id;
    };

    $scope.deleteEvent = function() {
	googleService.request.deleteEvent(eventId, userAuthData.uid).then(function(response){
	    $scope.refreshEvents();
	});
    };

    $scope.cancel = function() {
	$scope.showOverlay = false;
	$scope.logOutPop = false;
	$scope.deletePop = false;
    };

    $scope.cancelUpdate = function() {
	$scope.updating = false;
	$scope.notUpdating = true;
    };

    $scope.logOut = function() {	
	delete $sessionStorage.authToken;
	delete $sessionStorage.loggedIn;
	delete $sessionStorage.projects;
	ref.unauth();
	$location.path('/');
    };

    $scope.displayLog = function() {
	!$scope.showLogFields ? $scope.showLogFields = true : $scope.showLogFields = false;
	$scope.showInvoiceFields = false;
	$scope.showChangeCompany = false;
	$scope.showChangeHourly = false;
    };

    $scope.displayInvoice = function() {
	!$scope.showInvoiceFields ? $scope.showInvoiceFields = true : $scope.showInvoiceFields = false;
	$scope.showLogFields = false;
	$scope.showChangeCompany = false;
	$scope.showChangeHourly = false;	
    };

    $scope.displayChangeCompany = function() {
	!$scope.showChangeCompany ? $scope.showChangeCompany = true : $scope.showChangeCompany = false;
	$scope.showLogFields = false;
	$scope.showInvoiceFields = false;
	$scope.showChangeHourly = false;
    };

    $scope.displayChangeHourly = function() {
	!$scope.showChangeHourly ? $scope.showChangeHourly = true : $scope.showChangeHourly = false;

	$scope.showLogFields = false;
	$scope.showInvoiceFields = false;
	$scope.showChangeCompany = false;
    };

    $scope.updateCompany = function() {
	$localStorage.companyName = $scope.user.companyName;
	$scope.crudHeader = $localStorage.companyName;
	$scope.displayChangeCompany();
    };

    $scope.updateHourly = function() {
	$localStorage.hourlyRate = $scope.user.hourlyRate;
	$scope.displayChangeHourly();
    };    

    $scope.displayLogs = function() {
	$scope.centerLogContainer ? $scope.centerLogContainer = false : $scope.centerLogContainer = true;
	!$scope.showCrudFields ? $scope.showCrudFields = true : $scope.showCrudFields = false;
    };
});
