var app = angular.module('manifest');

app.controller('ProjectController', function($rootScope, $scope, envService, googleService, $location, $sessionStorage, $localStorage, $q, $interval, invoiceService) {    
    $scope.showIdInput = true;
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
    $rootScope.userId = $localStorage.userCalId || null;
    var ref = envService.firebase.auth();
    var userAuthData = ref.getAuth(),
	tokens = envService.firebase.tokens(userAuthData.uid),
	eventId;
	

    var loadCalScreen = function(data) {
	$localStorage.companyName = $scope.user.companyName;
	$localStorage.hourlyRate = $scope.user.hourlyRate;
	$scope.crudHeader = $scope.user.companyName;
	$scope.showIdInput = false;
	$scope.showCrudFields = true;	
	$scope.events = data;
	$scope.parseProjects(data);
    };
    
    $rootScope.$watch('userId', function(newValue, oldValue){
	console.log('Old value: ', oldValue);
	console.log('New value: ', newValue);
	$localStorage.userCalId = newValue;	
	if (newValue) {
	    console.log('Making ref.auth check');
	    ref.onAuth(function(authData){
		if (authData) {
		    console.log('User auth successful');		    
		    tokens.$loaded().then(function(){
			googleService.authenticate.request(tokens.access, tokens.refresh, newValue, authData.uid).then(function(res, newToken){
			    if (newToken) {
				console.log('Requesting new access token');
				googleService.authenticate.request(newToken, null, $localStorage.userCalId, authData.uid).then(function(secondRes){
				    console.log('New access token saved, now loading calendar view');
				    loadCalScreen(secondRes);
				});
			    } else {
				console.log('Loading calendar view');
				console.log('Current calendar id: ', $localStorage.userCalId);
				loadCalScreen(res);
			    }			    
			});		    
		    });
		}				
	    });	    
	};
    });
    
    $scope.requestEvents = function(id) {
	id = id || $scope.user.calendarId;
	$rootScope.userId = id || $localStorage.userCalId;
    };

    $scope.refreshEvents = function(id) {
	id = id || $localStorage.userCalId;
	googleService.authenticate.request(tokens.access, tokens.refresh, $localStorage.userCalId, userAuthData.uid).then(function(res){ 
	    loadCalScreen(res);
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
	googleService.request.newEvent($scope.newEvent, userAuthData.uid).then(function(response){
	    console.log($scope.newEvent);
	    $scope.refreshEvents();
	});
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
	delete $localStorage.userCalId;
	delete $sessionStorage.authToken;
	delete $sessionStorage.loggedIn;
	delete $sessionStorage.projects;
	ref.unauth();
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
    };
});
