angular.module('coding_test', ['ui.bootstrap'])
    .controller('s2e', function ($scope, $q, $http) {

        const SIMILARITY_THRESHOLD = 0.8; // arbitrary value, to be tweaked by testing
        const MAX_RESULTS_PER_ENGINE = 50; // arbitrary value

        // API keys
        const BING_API_KEY = '4f679222b9ee4105b0b517046082524d'; // 7-day trial to expire on 16.04.2019
        const BING_CUSTOM_ID = 'a74e4483-dd8f-4f1f-922c-d22d1ebbd60a'
        const GOOGLE_API_KEY = 'AIzaSyCLRmxBxFyABgKGbC-7cEO6JiWcgNHZsYc'; // Free tier with 100 querries/day limit
        const RAPID_API_KEY = 'ea2f6f7025msh4b16fac044108dcp12a222jsn322d0a3adc94'; // Free tier with 10k querries/month

        var SEARCH_TERM;

        $scope.availableEngines = [
            {
                name: 'Google',
                //                function: searchGoogle(),
                selected: true,
                disabled: false
            },
            {
                name: 'Bing',
                //                function: searchBing(),
                selected: true,
                disabled: false

            },
            {
                name: 'Contextual Web',
                //                function: searchContextualWeb(),
                selected: false,
                disabled: true
            }
        ];

        // set up some variables used in pagination
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.itemsPerPage = 10;

        // will use {} so its easier to merge results at later stage
        // while tempting to use [] where results remain ranked, they would have to be re-ranked once merged
        var googleResults = {};
        var bingResults = {};
        var contextualWebResults = {};

        // will store ready-to-display results here
        $scope.rankedSearchResults = [];

        $scope.searching = false;

        function searchGoogle() {
            var deferred = $q.defer();
            googleResults = {};

            // need to keep track of the number of responses that came back
            // so I know when to resolve
            var responseCount = 0;

            for (var i = 1; i < MAX_RESULTS_PER_ENGINE; i += 10) {
                $.ajax({
                    method: 'GET',
                    dataType: 'jsonp',
                    url: 'https://www.googleapis.com/customsearch/v1?key=' + GOOGLE_API_KEY + '&cx=002501037099736245903:klbrenxvcxk&q=' + SEARCH_TERM + '&start=' + i,

                    success: (res) => {
                        if (res.items != undefined) {

                            //                            console.log(res);
                            // some processing to match desired schema
                            res.items.forEach(function (search_result) {
                                currentResult = {
                                    "title": search_result.title,
                                    "url": search_result.link,
                                    "snippet": search_result.snippet,
                                    "sourceEngine": "google",
                                }
                                googleResults[currentResult['url']] = currentResult;
                            });
                        } else {
                            console.log('got empty response from google');
                        }

                        responseCount++;

                        // resolve it all expected responses came back
                        if (responseCount == MAX_RESULTS_PER_ENGINE / 10) {
                            //                            console.log('resolving', googleResults);
                            deferred.resolve('google');
                        }
                    },
                    failure: (err) => {
                        console.log('google error');
                    }
                });
            };

            //            console.log('resolving', googleResults);
            //            deferred.resolve('google');

            return deferred.promise;
        }

        function searchBing() {
            var deferred = $q.defer();

            bingResults = {};

            $.ajax({
                method: 'GET',
                headers: {
                    'Ocp-Apim-Subscription-Key': BING_API_KEY,
                },
                url: 'https://api.cognitive.microsoft.com/bingcustomsearch/v7.0/search?q=' + SEARCH_TERM + '&customconfig=' + BING_CUSTOM_ID + '&safeSearch=Off&mkt=en-GB&count=' + MAX_RESULTS_PER_ENGINE,

                success: (res) => {
                    if (res.webPages != undefined) {
                        // some processing to match desired schema
                        res.webPages.value.forEach(function (search_result) {
                            currentResult = {
                                "title": search_result.name,
                                "url": search_result.url,
                                "snippet": search_result.snippet,
                                "sourceEngine": "bing",
                            }

                            bingResults[currentResult['url']] = currentResult;
                        });
                    }

                    deferred.resolve('bing');
                },
                failure: (err) => {
                    console.log('bing error');
                }
            });

            return deferred.promise;
        }

        function searchContextualWeb() {
            var deferred = $q.defer();

            contextualWebResults = {};

            $.ajax({
                method: 'GET',
                dataType: 'json', //change the datatype to 'jsonp' works in most cases
                headers: {
                    'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com',
                    'X-RapidAPI-Key': RAPID_API_KEY
                },
                url: 'https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/WebSearchAPI?autoCorrect=true&pageNumber=1&pageSize=' + MAX_RESULTS_PER_ENGINE + '&q=' + SEARCH_TERM + '&safeSearch=false',

                success: (res) => {
                    if (res.value != undefined) {
                        // some processing to match desired schema
                        res.value.forEach(function (search_result) {
                            currentResult = {
                                "title": search_result.title,
                                "url": search_result.url,
                                "snippet": search_result.description,
                                "sourceEngine": "contextualWeb",
                            }

                            contextualWebResults[currentResult['url']] = currentResult;
                        })
                    }
                    deferred.resolve('ContextualWeb');
                },
                failure: (err) => {
                    console.log('CW error');
                }
            })

            return deferred.promise;
        }


        // Returns the state of 'Search' button based on state of search query input
        // and search engine checkboxes
        // false => disabled button
        $scope.getButtonState = function () {
            if ($scope.searchTerm == undefined) {
                return false;
            } else if ($scope.searchTerm.length < 1 || $scope.numSelected == 0) {
                return false;
            }

            return true;
        }

        $scope.search = function () {
            reset();
            $scope.searching = true;

            // encode raw search term as URI
            SEARCH_TERM = encodeURIComponent($scope.searchTerm);

            var promises = [$scope.availableEngines[0].selected ? searchGoogle() : null,
                            $scope.availableEngines[1].selected ? searchBing() : null,
                            $scope.availableEngines[2].selected ? searchContextualWeb() : null];

            console.log(promises);

            $q.all(promises).then(
                function (successResult) {

                    console.log(Object.keys(googleResults).length + ", " + Object.keys(bingResults).length + ", " + Object.keys(contextualWebResults).length);

                    // merge, removing duplicates
                    var mergedResults = Object.assign({}, googleResults, bingResults, contextualWebResults);

                    console.log('MERGED: ' + Object.keys(mergedResults).length, mergedResults);

                    // Rank the combined results
                    $scope.rankedSearchResults = rank(mergedResults);

                    // if got the results,
                    // otherwise notify the user
                    if ($scope.rankedSearchResults.length > 0) {
                        console.log('RANKED: ' + $scope.rankedSearchResults.length, $scope.rankedSearchResults);
                        $scope.totalItems = $scope.rankedSearchResults.length;
                    } else {
                        $scope.noResults = true;

                        // copying to the error dialog does not update failed querry while user interact with the search box
                        $scope.failedSearchTerm = $scope.searchTerm;
                    }

                    $scope.searching = false;
                },
                function (failureReason) {
                    console.log('ERROR');
                    $scope.searching = false;
                }
            );
        }


        // Returns the ranked results
        // admitedly, the ranking based on title and snippet only is less-than-optimal
        // morover, the results that were originally returned by engines, might be purged at this stage
        function rank(results) {
            // set up elacsticlunr's index
            var index = elasticlunr(function () {
                this.setRef('url');
                this.addField('title');
                this.addField('snippet');
            });

            // add results to elasticlunr's index
            for (var result in results) {
                index.addDoc(results[result]);
            }

            //            console.log('INDEX: ' + Object.keys(index.documentStore.docs).length, index);

            var rankedResults = index.search($scope.searchTerm, {
                fields: {

                    title: {
                        boost: 5
                    },
                    snippet: {
                        boost: 1
                    }
                }
            });

            return rankedResults;
        }

        // Please note that url is being opened in new window so the search is not unnecessarily repeated
        // in order to preserve low quotas on API calls
        $scope.openInNewWindow = function (result) {
            console.log(result);
            result['visited'] = new Date();

            window.open(result.url);
        }

        //  Returns similarity of two strings, in the range [0..1], where 1 indicates exact match
        //  https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely/36566052, by overlord1234
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
        
        //  A worker function used by similarity() function above
        //  https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely/36566052, by overlord1234
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

        // Updates the number of results displayed per page
        $scope.setItemsPerPage = function (num) {
            $scope.itemsPerPage = num;

            // display 1st page
            $scope.currentPage = 1;
        }

        // Handles the disabled/enabled state of the search engines
        $scope.updateEngineStates = function () {
            //count currently selected engines
            $scope.numSelected = $scope.availableEngines.filter(function (engine) {
                return engine.selected
            }).length;

            // if two engines are already selected, block the third one
            // admitedly for no good reason other than the acceptance criteria requiring 2 engines
            if ($scope.numSelected > 1) {
                $scope.availableEngines.forEach(function (engine) {
                    engine.disabled = !engine.selected;
                });
            } else {
                // Unlock all engines
                $scope.availableEngines.forEach(function (engine) {
                    engine.disabled = false;
                })
            }
        }

        // Resets variables and objects ready for a new search
        function reset() {
            googleResults = {};
            bingResults = {};
            contextualWebResults = {};
            $scope.rankedSearchResults = [];
            $scope.noResults = false;
            $scope.totalItems = 0;
            $scope.currentPage = 1;
        }

    });
