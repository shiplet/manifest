
var app = angular.module('myDirectives', []);

(function(){
    if (typeof jQuery === 'undefined') {
	throw new Error('Shiplet\'s Directive require jQuery, just like Bootstrap');
    };
})();

app.directive('pending', function($q){
    return {
	restrict: 'AE',
	scope: {
	    request: '&'
	},	
	link: function(scope, elem, attr) {
	    elem.bind('click', function(){	
		var deferred = $q.defer();
		$('*').css('cursor', 'progress');
		elem.text('Pending...');
		elem.attr('disabled', true);
		scope.request().then(function(response){		
		    setTimeout(function(){
			elem.text('Success!');
		    }, 1000);
		    setTimeout(function(){
			$('*').css('cursor', 'default');
			elem.text('Submit');
			elem.removeAttr('disabled');
			console.log(response);
			deferred.resolve(response);
		    }, 1500);
		});
		return deferred.promise;
	    });
	}
    };
});


app.directive('notify', function(){
    return {
	restrict: 'AE',
	scope: {
	    title: '=',
	    body: '=',
	    icon: '='
	},
	link: function(scope, elem, attr) {
	    var Notification = window.Notification || window.mozNotification || window.webkitNotification;
	    elem.bind('click', function(){
		Notification.requestPermission(function(permission){
		    if (permission === 'granted') {
			var notification = new Notification(scope.title, {
			    body: scope.body,
			    icon: scope.icon
			});
			
		    }
		});
		
		
            });
	}
    };       
});


app.directive('linkTouch', function() {
    return {
	restrict: 'A',
	scope: {},
	link: function(scope, elem, attr) {
	    elem.on('tap', function(){
		elem.toggleClass('touch-hover');
	    });
	}
    };
});

app.directive('linkAppTouch', function() {
    return {
	restrict: 'A',
	scope: {
	    appHref: '@',
	    webHref: '@'
	},
	link: function(scope, elem, attr) {
	    elem.on('tap', function(e){
		e.preventDefault();
		elem.toggleClass('touch-hover');
		window.location = scope.appHref;
		setTimeout(function(){
		    if (document.visibilityState === 'visible') {
			window.location = scope.webHref;
		    }
		}, 400);
	    });
	    elem.bind('click', function(e){
		e.preventDefault();
		window.location = scope.appHref;
		setTimeout(function(){
		    if (document.visibilityState === 'visible') {
			window.location = scope.webHref;
		    }
		}, 1000);
		
	    });
	}
    };
});

app.directive('portfolioBox', function($sce) {
    return {
	restrict: 'E',
	scope: {
	    img: '@',
	    info: '@',
	    link: '@'
	},
	templateUrl: "./js/partials/portfolioBox.html",
	link: function(s, e, a) {
	    s.image = s.img;
	    s.text = s.info;
	    s.external = s.link;
	    s.showInfo = function() {		
		if (!s.showInfoBox) {
		    s.showInfoBox = true;
		} else if (s.showInfoBox) {
		    s.showInfoBox = false;
		}		
	    };
	}
    };
});
