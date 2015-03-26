var app = angular.module('manifest');

app.controller('ProjectController', function($scope, envService, googleService, $location, $sessionStorage, $localStorage, $q, $stateParams, invoiceService) {    
    $scope.showIdInput = true;
    $scope.showCrudFields = false;
    $scope.showOverlay = false;
    $scope.logOutPop = false;
    $scope.deletePop = false;    
    $scope.showLogFields = false;
    $scope.notUpdating = true;
    $scope.updating = false;
    $scope.showInvoiceFields = false;    
    var eventId;

    googleService.authenticate.load().then(function(response){
	if (response === 'cal' && $sessionStorage.projects) {
	    $scope.showIdInput = false;
    	    $scope.crudHeader = $localStorage.userCalId;	
    	    $scope.showCrudFields = true;
    	    $scope.refreshEvents();
	} else if (response === 'cal' && !$scope.events && $sessionStorage.authToken && !$sessionStorage.oldToken && $sessionStorage.loggedIn) {
	    $sessionStorage.oldToken = $sessionStorage.authToken;
	    delete $sessionStorage.authToken;
	    setTimeout(function(){
		alert('Your session has timed out.');
		googleService.authenticate.mobile.session();
	    });
	} else if (response === 'cal' && !$scope.events && $sessionStorage.authToken && $sessionStorage.oldToken) {
	    delete $sessionStorage.oldToken;
	    $scope.requestEvents($localStorage.userCalId);
	}
    });    
    
    
    
    $scope.requestEvents = function(id) {
	id = id || $scope.user.calendarId;
	return googleService.request.calEvents(id).then(function(response){
	    $scope.crudHeader = id;
	    $scope.showIdInput = false;
	    $scope.showCrudFields = true;
	    $scope.events = response;
	    $scope.parseProjects(response);
	});
    };

    $scope.refreshEvents = function(id) {
	id = id || $localStorage.userCalId;
	googleService.request.calEvents(id).then(function(response){
	    $scope.events = response;
	    $scope.parseProjects(response);
	});
    };

    $scope.parseProjects = function(data) {	
	$sessionStorage.projects = [];
	var x = data.filter(function(y) {
	    if (y.summary.indexOf(':') !== -1) {
		return y;
	    }
	});
	x.map(function(z) {
	    var a = z.summary.split(':');
	    if ($sessionStorage.projects.indexOf(a[0]) === -1) {
		$sessionStorage.projects.push(a[0]);
	    }
	});
	$scope.projects = $sessionStorage.projects;
    };

    $scope.submitNewEvent = function() {
	googleService.request.newEvent($scope.newEvent).then(function(response){
	    $scope.newEvent = {};
	    $scope.refreshEvents();
	});
    };

    $scope.submitUpdate = function(event) {
	googleService.request.updateEvent(event).then(function(){
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
	googleService.request.deleteEvent(eventId).then(function(response){
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
	delete $localStorage.userCalId;
	delete $sessionStorage.authToken;
	delete $sessionStorage.loggedIn;
	delete $sessionStorage.projects;
	if ($sessionStorage.oldToken) {
	    delete $sessionStorage.oldToken;
	}
	$location.path('/');
    };

    $scope.displayLog = function() {
	if (!$scope.showLogFields) {
	    $scope.showLogFields = true;
	} else if ($scope.showLogFields) {
	    $scope.showLogFields = false;
	}
    };

    $scope.displayInvoice = function() {
	!$scope.showInvoiceFields ? $scope.showInvoiceFields = true : $scope.showInvoiceFields = false;
    }
});
