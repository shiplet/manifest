var app = angular.module('manifest');

app.service('invoiceService', function($location, $sessionStorage){
    return {
	createInvoice: function(i) {
	    $location.path('/invoice');
	    $sessionStorage.invoice = {};
	    $sessionStorage.invoice.project = i.project;
	    $sessionStorage.invoice.events = i.events;
	    $sessionStorage.invoice.dateRange = i.dateRange;
	    $sessionStorage.invoice.totalHours = 0;
	    i.events.forEach(function(e){
		$sessionStorage.invoice.totalHours += e.duration;
	    });
	}
    };
});
