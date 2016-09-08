'use strict';

/* Services */
angular.module('myApp.services', [])

    .factory('pagesFactory', ['$http',
      function($http) {

        return {
          getWpPages: function (url) {
            // Use $http to call the wordpress API, filtered on the title that is specified by the menu
            return $http.get('http://127.0.0.1/wordpress/wp-json/pages?filter[s]=' + url)
          },
          getWpMenu: function (language) {
            // Language is proposal, at least a different menu can be called based on the language specified
            // Menu item can only be pre-specified, but might be stored in config or something similar.
            if (language == 'nl') {
              return $http.get('http://127.0.0.1/wordpress/wp-json/menus/13')
            } else if (language == 'en') {
              return $http.get('http://127.0.0.1/wordpress/wp-json/menus/12')
            }
          }
        };
      }
    ])
    .factory('myHttpInterceptor', ['$q', '$location', function($q, $location) {
      return {
        response: function(response) {
          return response;
        },
        responseError: function(response) {
          if (response.status === 401) {
            $location.path('/admin/login');
            return $q.reject(response);
          }
          return $q.reject(response);
        }
      };
    }]);



