var app = angular.module('manifest', ['ngStorage', 'ui.router', 'firebase']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider){
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode({enabled:true,requireBase:true});
    $stateProvider
	.state('/', {
	    url: '/',
	    templateUrl: './js/partials/home.html',
	    controller: 'MainController'
	})
	.state('manage-projects', {
	    url: '/manage-projects',
	    templateUrl: './js/partials/projects.html',
	    controller: 'ProjectController'
	})
	.state('invoice', {
	    url: '/invoice',
	    templateUrl: './js/partials/invoicing.html',
	    controller: 'InvoiceController',
	    resolve: {
		getInvoiceProjects: function($sessionStorage){
		    return $sessionStorage.invoice;
		}
	    }
	});
});

app.run(function($rootScope, $sessionStorage, $location, envService){
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
	var ref = envService.firebase.auth();
	ref.onAuth(function(authData){
	    if (!authData) {
		$location.path('/');
	    }
	});
    });
});
