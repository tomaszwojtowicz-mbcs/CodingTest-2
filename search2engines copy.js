angular.module('demo', [])
    .controller('s2e', function ($scope, $q, $http) {

        const SIMILARITY_THRESHOLD = 0.8; // arbitrary value, to be tweaked by testing

        // API keys
        const BING_API_KEY = '4f679222b9ee4105b0b517046082524d'; // 7-day trial to expire on 16.04.2019
        const BING_CUSTOM_ID = 'a74e4483-dd8f-4f1f-922c-d22d1ebbd60a'
        const GOOGLE_API_KEY = 'AIzaSyCLRmxBxFyABgKGbC-7cEO6JiWcgNHZsYc'; // Free tier with 100 querries/day limit
        const RAPID_API_KEY = 'ea2f6f7025msh4b16fac044108dcp12a222jsn322d0a3adc94'; // Free tier with 10k querries/month

        var SEARCH_TERM;

        var engine1Results = [];
        var engine2Results = [];
        var engine3Results = [];

        $scope.finalSearchResults = [];

        $scope.searching = false;

        //elastic
        var index = elasticlunr(function () {
            this.setRef('url');
            this.addField('title');
            this.addField('snippet');
        });

        function searchGoogle() {
            var deferred = $q.defer();

            $.ajax({
                method: 'GET',
                url: 'https://www.googleapis.com/customsearch/v1?key=' + GOOGLE_API_KEY + '&cx=002501037099736245903:klbrenxvcxk&q=' + SEARCH_TERM,
                dataType: 'jsonp',

                success: (res) => {
//                    console.log(res.items);
                    var googleResults = [];

                    // some processing to match desired schema
                    res.items.forEach(function (search_result) {
                        new_obj = {
                            "title": search_result.title,
                            "url": search_result.formattedUrl,
                            "snippet": search_result.snippet,
                            "sourceEngine": "google",
                        }

                        googleResults.push(new_obj);
                    });

                    engine1Results = googleResults;

                    deferred.resolve('google');
                }
            });

            return deferred.promise;
        }

        function searchBing() {
            var deferred = $q.defer();

            $.ajax({
                method: 'GET',
                url: 'https://api.cognitive.microsoft.com/bingcustomsearch/v7.0/search?q=' + SEARCH_TERM + '&customconfig=' + BING_CUSTOM_ID + '&safeSearch=Off&mkt=en-GB',

                headers: {
                    'Ocp-Apim-Subscription-Key': BING_API_KEY,
                },

                success: (res) => {
//                    console.log(res.webPages.value);
                    var bingResults = [];

                    // some processing to match desired schema
                    res.webPages.value.forEach(function (search_result) {
                        new_obj = {
                            "title": search_result.name,
                            "url": search_result.url,
                            "snippet": search_result.snippet,
                            "sourceEngine": "bing",
                        }
                        bingResults.push(new_obj);
                        
//                        index.addDoc(new_obj);
                    })

                    // COME UP WITH SOMETHING BETTER, SO NUMBERS ARE ALLOCATED DYNAMCALLY - IN CASE GOOGLE IS NOT SELECTED

                    engine2Results = bingResults;

                    deferred.resolve('bing');
                },
                failure: (err) => {
                    console.log('error');
                }
            });

            return deferred.promise;
        }

        function searchContextualWeb() {
            var deferred = $q.defer();

            $.ajax({
                method: 'GET',

                url: 'https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/WebSearchAPI?autoCorrect=true&pageNumber=1&pageSize=10&q=' + SEARCH_TERM + '&safeSearch=false',

                dataType: 'json', //change the datatype to 'jsonp' works in most cases

                headers: {
                    'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com',
                    'X-RapidAPI-Key': RAPID_API_KEY
                },

                success: (res) => {
                    var contextualWebResults = [];
                    //                    console.log(res);
                    //                            contextualWebResults = res.value;

                    // some processing to match desired schema
                    res.value.forEach(function (search_result) {
                        new_obj = {
                            "title": search_result.title,
                            "url": search_result.url,
                            "snippet": search_result.description,
                            "sourceEngine": "contextualWeb",
                        }
                        contextualWebResults.push(new_obj);
                        //                        search_result.htmlTitle = search_result.title;
                        //                        delete search_result.title;
                    })

                    //                    contextualWebFinished = true;

                    engine2Results = contextualWebResults;

                    deferred.resolve('ContextualWeb');
                },
                failure: (err) => {
                    console.log('error');
                }
            })

            return deferred.promise;
        }

        function editDistance(s1, s2) {
            s1 = s1.toLowerCase();
            s2 = s2.toLowerCase();

            var costs = new Array();
            for (var i = 0; i <= s1.length; i++) {
                var lastValue = i;
                for (var j = 0; j <= s2.length; j++) {
                    if (i == 0)
                        costs[j] = j;
                    else {
                        if (j > 0) {
                            var newValue = costs[j - 1];
                            if (s1.charAt(i - 1) != s2.charAt(j - 1))
                                newValue = Math.min(Math.min(newValue, lastValue),
                                    costs[j]) + 1;
                            costs[j - 1] = lastValue;
                            lastValue = newValue;
                        }
                    }
                }
                if (i > 0)
                    costs[s2.length] = lastValue;
            }
            return costs[s2.length];
        }

        // Returns similarity of two strings, in the range [0..1], where 1 indicates exact match
        function similarity(s1, s2) {
            var longer = s1;
            var shorter = s2;

            // ensure that the strings are ordered by their lenght
            if (s1.length < s2.length) {
                longer = s2;
                shorter = s1;
            }

            var longerLength = longer.length;

            if (longerLength == 0) {
                return 1.0;
            }

            return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
        }

        // Returns the state of 'Search' button based on state of search query input
        // false => disabled button
        $scope.getButtonState = function () {
            if ($scope.searchTerm == undefined) {
                return false;
            } else if ($scope.searchTerm.length < 1) {
                return false;
            }

            return true;
        }

        $scope.search = function () {
            // purge old results, so the user get some feedback
            $scope.searching = true;

            SEARCH_TERM = encodeURIComponent($scope.searchTerm);

            $q.all([searchGoogle(), searchBing()]).then(
                function (successResult) {

                    console.log(engine1Results);
                    console.log(engine2Results);

                    // remove duplicates
                    engine1Results.forEach(function (engine1Result) {

                        for (var i = 0; i < engine2Results.length; i++) {

                            // skip the results removed during previous iteration
                            if (engine2Results[i] != null) {

                                // remove sufficiently similar results, based on their URL
                                if (similarity(engine1Result.url, engine2Results[i].url) > SIMILARITY_THRESHOLD) {
                                    engine2Results[i] = null;
                                }


                            }
                        }
                    })

                    // concatenate result arrays, skipping results removed above
                    $scope.finalSearchResults = [...engine1Results, ...engine2Results.filter(function (result) {
                        return result != null;
                    })];


                    console.log($scope.finalSearchResults);
                    
                    // add results to elasticlunr's index
                    $scope.finalSearchResults.forEach(function (result) {
                        index.addDoc(result);
                    }) 
                    
                    // sea
                    var tmp = index.search($scope.searchTerm, {
                        fields: {
                            title: {
                                boost: 2
                            },
                            snippet: {
                                boost: 1
                            }
                        }
                    });
                    
                    console.log(tmp);
                    
                    $scope.searching = false;

                },
                function (failureReason) {

                    console.log('ERROR');

                }
            );
        }

        // Please note that url is being opened in new window so the search is not repeated
        // in order to preserve low quotas on API calls
        $scope.openInNewWindow = function (url) {
            window.open(url);
        }

    });
