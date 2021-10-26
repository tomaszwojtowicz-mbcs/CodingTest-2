angular.module('demo', [])
    .controller('Hello', function ($scope, $http) {

        var SEARCH_TERM = 'Brexit';


        $.ajax({
            method: 'GET',

            url: 'https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/WebSearchAPI?autoCorrect=true&pageNumber=1&pageSize=10&q=Brexit&safeSearch=false',
            
            dataType: 'json', //change the datatype to 'jsonp' works in most cases

            headers: {
                'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com',
                 'X-RapidAPI-Key': 'ea2f6f7025msh4b16fac044108dcp12a222jsn322d0a3adc94'
            },

//            
            success: (res) => {
                console.log(res);
            },
            failure: (err) => {
                console.log('error');
            }
        })




    });
