var app = angular.module('manifest');

app.controller('InvoiceController', function($scope, $sessionStorage, envService, invoiceService, getInvoiceProjects){
    $scope.projects = getInvoiceProjects;
});
