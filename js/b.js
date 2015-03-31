var app = angular.module('manifest');

app.service('envService', function($window, $http, $firebaseArray, $firebaseObject, $q){
    return {
	firebase: {
	    auth: function() {
		return new Firebase('https://manifest.firebaseio.com');
	    },
	    oauth: function() {
		return $firebaseObject(new Firebase('htts://manifest.firebaseio.com/env'));
	    },
	    users: function() {
		return $firebaseObject(new Firebase('https://manifest.firebaseio.com/users'));
	    },
	    tokens: function(uid) {
		return $firebaseObject(new Firebase('https://manifest.firebaseio.com/users/'+uid));
	    }
	},
	getInvoice: function(invoice, events) {
	    var project = invoice.project;
	    var iStart = invoice.startDate;
	    var iEnd = moment(invoice.endDate).add(1, 'days');
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
	    return {
		project: project,
		dateRange: {
		    invoiceStart: iStart,
		    invoiceEnd: iEnd
		},
		events: p
	    };
	}
    };
});
