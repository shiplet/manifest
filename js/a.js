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
	.state('invoicing', {
	    url: '/invoicing',
	    templateUrl: './js/partials/invoicing.html',
	    controller: 'InvoiceController',
	    resolve: {
		getInvoiceProjects: function($sessionStorage){
		    return $sessionStorage.invoiceProjects;
		}
	    }
	});
});

app.run(function($rootScope, $sessionStorage, $location){
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
	if (!$sessionStorage.authToken) {
	    if (toState.url === '/manage-projects' && fromState.url === '/') {
		event.preventDefault();
	    }
	}	
    });
});
