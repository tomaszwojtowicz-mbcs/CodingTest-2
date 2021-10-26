angular.module('demo', [])
    .controller('Hello', function ($scope, $http) {

    var SEARCH_TERM = 'Brexit';
    
    var GOOGLE_CSE_ID = '002501037099736245903:klbrenxvcxk';
    var GOOGLE_API_KEY = 'AIzaSyCLRmxBxFyABgKGbC-7cEO6JiWcgNHZsYc';
    
    function Google_handler(response) {
          
          console.log(response);
          
//      for (var i = 0; i < response.items.length; i++) {
//        var item = response.items[i];
//        // in production code, item.htmlTitle should have the HTML entities escaped.
//        document.getElementById("content").innerHTML += "<br>" + item.htmlTitle;
//      }
    }
    
//        $.ajax({
//            method: 'GET',
//            url: 'https://www.googleapis.com/customsearch/v1?key=AIzaSyCLRmxBxFyABgKGbC-7cEO6JiWcgNHZsYc&cx=002501037099736245903:klbrenxvcxk&q=Brexit&callback=Google_handler',
//            dataType: 'jsonp', //change the datatype to 'jsonp' works in most cases
//            success: (res) => {
//                console.log(res);
//            }
//        })
    
    
    
    
    });
