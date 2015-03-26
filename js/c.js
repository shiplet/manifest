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


/// Project View Controller ///

app.controller('ProjectController', function($scope, envService, googleService, $location, $sessionStorage, $localStorage, $q, $stateParams) {    
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

    if (!$sessionStorage.projects && !$sessionStorage.authToken) {
	$location.path('/');
	console.warn('No project data');
    } else {
	googleService.authenticate.load().then(function(response){
    	    if (response === 'auth') {
    		$scope.showIdInput = false;
    		$scope.crudHeader = $localStorage.userCalId;	
    		$scope.showCrudFields = true;
    		googleService.request.calEvents($localStorage.userCalId)
    		    .then(function(response){		   
    			$scope.events = response;
    			$scope.parseProjects(response);
    		    });
    	    }
	});		
    }
  

    $scope.requestEvents = function() {
	googleService.request.calEvents($scope.user.calendarId).then(function(response){
	    $scope.crudHeader = $scope.user.calendarId;
	    $scope.showIdInput = false;
	    $scope.showCrudFields = true;
	    $scope.events = response;
	    $scope.parseProjects(response);
	});
    };

    $scope.refreshEvents = function() {
	googleService.request.calEvents($localStorage.userCalId).then(function(response){
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
