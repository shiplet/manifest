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
	    var projects = [];
	    // var p = events.filter(function(x){
	    // 	if (x.summary.split(':')[0] === project) {
	    // 	    return x;
	    // 	}
	    // });
	    events.forEach(function(i){
		var eStart = i.start.dateTime;
		var eEnd = i.end.dateTime;
		if (eStart > iStart && eEnd < iEnd) {
		    console.log(i.summary);
		    console.log('iStart: ', moment(iStart).format('MMM Do YYYY, h:mm:ss a'));
		    console.log('eStart: ', moment(eEnd).format('MMM Do YYYY, h:mm:ss a'));
		    console.log('eEnd: ', moment(eEnd).format('MMM Do YYYY, h:mm:ss a'));
		    console.log('iEnd: ', moment(iEnd).format('MMM Do YYYY, h:mm:ss a'));
		    console.log('\n');
		}
	    });
	}
    };
});
