var app = angular.module('manifest');

app.service('envService', function($window, $http, $firebaseArray, $firebaseObject, $q){
    return {
	firebase: {
	    auth: function() {
		return new Firebase('https://manifest.firebaseio.com');
	    },
	    oauth: function() {
		return $firebaseObject(new Firebase('htts://manifest.firebaseio.com/production-env'));
	    },
	    users: function() {
		return $firebaseObject(new Firebase('https://manifest.firebaseio.com/users'));
	    },
	    tokens: function(uid) {
		return $firebaseObject(new Firebase('https://manifest.firebaseio.com/users/'+uid));
	    }
	},
	getTimes: function() {
	    var x = [];
	    for (var i = 1; i < 13; i++) {		  
		x.push(i + ':00', i + ':15', i + ':30', i + ':45');
		};
	    return x;
	},
	getInvoice: function(invoice, events) {
	    var project = invoice.client+':'+invoice.project;
	    console.log(project);
	    var iStart = Date.parse(moment(invoice.startDate).format());
	    var iEnd = Date.parse(moment(invoice.endDate).add(1, 'days').format());
	    var edgeCount = 0;
	    console.log(events);
	    var p = events.filter(function(i){
	    	var eStart = i.start.dateTime;
	    	var eEnd = i.end.dateTime;
	    	var iProject = i.summary ? (i.summary.indexOf(':') !== -1 ? i.summary.split('|||')[0].replace(' ', '') : i.summary.split('|||')[0].toUpperCase()) : undefined;
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
