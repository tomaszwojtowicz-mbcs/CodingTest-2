angular.module('demo', [])
    .controller('Hello', function ($scope, $http) {

getGoogleSearchResults('Brexit');

        function getGoogleSearchResults(q) {

            // Get the API key from Google's developer console
            // Get the CSE ID from google.com/cse

            KEY = 'AIzaSyCLRmxBxFyABgKGbC-7cEO6JiWcgNHZsYc';
            
//            var api = "https://www.googleapis.com/customsearch/v1?key=" + KEY + "&cx=" + CSE + "&q=" + encodeURIComponent(q);
            var api = "https://www.googleapis.com/customsearch/v1?key=" + KEY + "&q=" + encodeURIComponent(q);

            try {

                var response = UrlFetchApp.fetch(api, {
                    muteHttpExceptions: true
                });

                if (response.getResponseCode() == 200) {

                    var content = JSON.parse(response);

                    // Did the search return any results?
                    if (content.searchInformation.totalResults > 0) {

                        var count = content.items.length;

                        for (var i = 0; i < count; i++) {

                            // Save the page title, description and hyperlink
                            console.log(content.items[i].title);
                            console.log(content.items[i].snippet);
                            console.log(content.items[i].link);
                        }
                    }
                }
            } catch (f) {
                console.log(f.toString());
            }

        }


    });
