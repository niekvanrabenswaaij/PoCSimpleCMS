'use strict';

/* Directives */


angular.module('myApp.directives', [])
    .directive('appVersion', ['version', function(version) {
      return function(scope, elm, attrs) {
        elm.text(version);
      };
    }])
    .directive('navBar', [
      function() {
        return {
          controller: function($scope, pagesFactory, $sce) {
              // Example how to add support for different languages. Im not entirely happy about this solution yet, since the
              // main content of a menu page doesn't chance in this situation, so menu easily converts lanuage, but the main page
              // content stay the old language. Can be solved by reloading the main page after the language chance, but it is not
              // a very pretty solution

              // Set default value, now as a string, should be taken from a conf file or something similar
              var defaultValue = 'nl';
              // Variable to be able to show/hide language chance buttons
              $scope.lang = defaultValue;
              // Load the menu from wordpress api using a factory and the language default value to determine which menu to load
              pagesFactory.getWpMenu(defaultValue).then(
                  function(response) {
                      // Use the buildMenu method and the response object to build a menu JSON object with the necessary info to build the menu html
                      // var htmlMenu is a var with the html content
                      var htmlMenu = buildMenu(response);
                      // Send the information as trusted html to scope so it can be used in the template view
                      $scope.navLinksHtml = $sce.trustAsHtml(htmlMenu);
                  }, function() {

                  });
              $scope.changeLanguage = function (key) {
                  $scope.lang = key;
                  pagesFactory.getWpMenu(key).then(
                      function(response) {
                          var htmlMenu = buildMenu(response);
                          $scope.navLinksHtml = $sce.trustAsHtml(htmlMenu);
                      }, function() {

                      });
              };

           },
          templateUrl: 'partials/directives/nav.html'

        };
      }
    ])
;

function buildMenu(response) {
    // Use the buildJsonMenu method to build a json object with only the necessary info for the html menu
    var menu = buildJsonMenu(response.data.items);
    // The order of the menu is removed since the object is build based on menuItemID's in order to restore the correct order
    // every <li> is stored in a JSON object based on the order var of the parent menuItem in liItem
    var liItem = {};
    //Use jQuery to itterate over all menuItems
    jQuery.each(menu, function (i,val) {
        // Parent == 0 indicates that the menu item doesnt have any parents and thus is a starting point to build a li html object
        // of the first ul of the menu
        if(val.parent === 0) {
            // variable to store the html code
            var retStr ='';
            // If the menuItem has children a new ul should be created for the children menuItems of this menuItem. In case of an empty list
            // the li is created with a link in it and the title of the page
            if(val.children.length > 0) {
                // The li item of the parent menuItem is created with a link and the title. The title is used for fetching the pages,
                // no other reference information is stored in the menu api of wordpress. Classes are added for styling purposes.
                retStr += '<li class="orange"><a href="/' + menu[i].title + '">' + menu[i].title + '</a>';
                // Since this menuItem has children a new ul is created to get a new list.
                retStr += '<ul>';
                // Starting a new method for every child in this menuItem parent
                for (var childIndex = 0; childIndex <= val.children.length - 1; childIndex++) {
                    // get correct menuItem from the menuItemList based on the children list ID's and pass the menu item to the submethod,
                    // this method builds the next li structure, but can be called again if the subMenuItem has children again. Result
                    // is an html variable that is added to the already existing code
                    retStr += buildHtmlSubMenu(menu[val.children[childIndex]], menu);
                }
                // ul is closed
                retStr += '</ul>';
            } else {
                retStr += '<li class="orange"><a href="/' + menu[i].title + '">' + menu[i].title + '</a>';
            }
            // li is closed and added to an order based JSON object
            retStr += '</li>';
            // Add li to liItem var based on the order of the first item, then find next parent menuItem
            liItem[val.order] = {
                'li': retStr
            }
        }
    });
    var htmlMenu = '';
    // Add li's to html variable
    jQuery.each(liItem, function (i,val) {
        htmlMenu += val.li;
    });
    // return html Menu
    return htmlMenu;
}

function buildHtmlSubMenu(subMenu, menu) {
    // Store the html code into retStr variable
    var retStr = '';
    // Check if submenu has children or not, if no children add li, a tags and title and quit method,
    // else start new ul tag.
    if (subMenu.children.length > 0) {
        retStr = '<li class="orange"><a href="/' + subMenu.title + '">' + subMenu.title + '</a>';

        retStr += '<ul>';
        for (var childIndex = 0; childIndex <= subMenu.children.length - 1; childIndex++) {
            // This method can be repeated over and over till there are no new children of children left
            retStr += buildHtmlSubMenu(menu[subMenu.children[childIndex]], menu);
        }
        retStr += '</ul>';
    } else {
        retStr = '<li class="orange"><a href="/' + subMenu.title + '">' + subMenu.title + '</a>'
    }
    retStr += '</li>';
    return retStr;
}

function buildJsonMenu(menuItemsWordpress) {
    //Variable to store the JSON-Objects with information to build the menu
    var menuItemsSite = {};
    //For every item in menuItemsWordpress get only the necessary information and set the children of menuItems
    for (var i = 0; i < menuItemsWordpress.length; i++) {
        //Create menuItem with just the necessay information only
        var menuItem = createMenuItem(menuItemsWordpress[i]);
        //Add menuitem to JSON Menu object
        menuItemsSite[menuItem.id] = menuItem;
        //Add menuItemID to children list of parent menuItem:
        // 1. check if menuitem has parents
        // 2. get the children list object of the parent menuitem, wordpress object list is given in correct order, so the parent of a menuitem should, in all cases, already be in the list
        // 3. push menuItemID to the children list
        if(menuItem.parent !== 0) {
            menuItemsSite[menuItem.parent].children.push(menuItem.id);
        }
    }
    return menuItemsSite;
}

function createMenuItem(menuItemWordpress) {
    //Create a JSON Object with just the necessary information to build the menu
    var menuItem = {
        'id': menuItemWordpress.ID,
        'title': menuItemWordpress.title,
        'order': menuItemWordpress.order,
        'parent': menuItemWordpress.parent,
        'children': []
    };
    return menuItem;
}
