'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AppCtrl', ['$scope', function($scope) {
        $scope.site = {
            logo: "img/angcms-logo.png",
            footer: "Copyright 2014 Angular CMS"
        };
    }])
    .controller('PageCtrl', ['$scope','pagesFactory', '$routeParams', '$sce', function($scope, pagesFactory, $routeParams,$sce) {
        var url = $routeParams.url;
        if(!url) url="home";
        // Get page based on url/title specified in the menu
        pagesFactory.getWpPages(url).then(
            function(response) {
                // Check if the page exists in wordpress
                if(response.data.length > 0) {
                    // if page exists then get page content from first page
                    $scope.contentWpPage = $sce.trustAsHtml(response.data[0].content);
                }
            }, function() {
                console.log('error fetching data');
            });

    }]);
