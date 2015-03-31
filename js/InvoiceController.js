var app = angular.module('manifest');

app.controller('InvoiceController', function($scope, $sessionStorage, $localStorage, envService, invoiceService, getInvoiceProjects){
    $scope.showOverlay = $localStorage.seenOverlay ? false : true;

    var invoice = getInvoiceProjects;
    $scope.companyName = $localStorage.companyName;
    $scope.from = moment(invoice.dateRange.invoiceStart).format('MMM Do YYYY');
    $scope.to = moment(invoice.dateRange.invoiceEnd).format('MMM Do YYYY');
    $scope.project = invoice.project;
    $scope.events = invoice.events;
    $scope.hourlyRate = $localStorage.hourlyRate;
    $scope.totalHours = invoice.totalHours;
    
    $scope.cancel = function() {
	$localStorage.seenOverlay = true;
	$scope.showOverlay = false;
    };
});
