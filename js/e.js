var app = angular.module('manifest');

app.service('invoiceService', function($location, $sessionStorage){
    return {
	createInvoice: function(i) {
	    $location.path('/invoicing');
	    $sessionStorage.invoiceProjects = i;
	    i.forEach(function(x){
		console.log(x.summary);
	    });
	}
    };
});
