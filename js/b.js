var app = angular.module('manifest');

app.service('envService', function($window, $http, $firebaseArray, $firebaseObject, $q){
    return {
	getEnv: function() {
	    return $http({
		method: 'GET',
		url: 'js/getEnv'
	    }).then(function(success){
		return success.data;
	    }, function(error){
		return error;
	    });
	},
	getInvoice: function(invoice, events) {
	    var project = invoice.project;
	    var iStart = invoice.startDate;
	    var iEnd = moment(invoice.endDate).add(1, 'days');
	    var start = moment(invoice.startDate).format('MMM Do YYYY, h:mm:ss a');
	    var end = moment(iEnd).format('MMM Do YYYY, h:mm:ss a');
	    var edgeCount = 0;
	    var p = events.filter(function(i){
	    	var eStart = i.start.dateTime;
	    	var eEnd = i.end.dateTime;
	    	var iProject = i.summary ? (i.summary.indexOf(':') !== -1 ? i.summary.split(':')[0] : i.summary.split(' ')[0].toUpperCase()) : undefined;
	    	if (iProject
	    	    && iProject === project
	    	    && eStart > iStart) {
		    if (eStart < iEnd && eEnd > iEnd) {
			edgeCount++;
			return i;
		    } else if (eEnd < iEnd) {
			return i;
		    }
	    	}
	    });
	    if (p.length === 0) {
		alert('No events in that range');
	    }
	    if (edgeCount) {
		alert('Heads up: you\'re invoicing an event that exceeds your date range.');
	    }
	    return p;
	}
    };
});
