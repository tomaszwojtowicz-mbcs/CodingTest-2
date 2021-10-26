angular.module('demo', [])
    .controller('Hello', function ($scope, $http) {

//        //  Google - does not seem to be able to make it work without custom search engine
//        $.ajax({
//            method: 'GET',
//            url: 'https://www.googleapis.com/customsearch/v1?key=AIzaSyCLRmxBxFyABgKGbC-7cEO6JiWcgNHZsYc&q="Brexit"',
//            dataType: 'jsonp', //change the datatype to 'jsonp' works in most cases
//            success: (res) => {
//                console.log(res);
//            }
//        })
    
    
        // Cookie names for stored data.
        var AZURE_API_KEY   = "f1d1257c7e994a57aa69f2154e3dac86";

        var BING_ENDPOINT = "https://api.cognitive.microsoft.com/bing/v7.0/search";

        var accountKey = AZURE_API_KEY;
        var accountKeyEncoded = base64_encode(":" + accountKey);

        jQuery.support.cors = true;

        function setHeader(xhr) {
            xhr.setRequestHeader('Authorization', "Basic " + accountKeyEncoded);
            //'Basic <Your Azure Marketplace Key(Remember add colon character at before the key, then use Base 64 encode it');
        }

            console.log('here');
            //Build up the URL for the request
            var requestStr = "https://api.datamarket.azure.com/Data.ashx/Bing/Search/v1/search=%Brexit%27&$top=50&$format=json";

            //Return the promise from making an XMLHttpRequest to the server
            $.ajax({
                url: requestStr,
                beforeSend: setHeader,
                context: this,
                type: 'GET',
                success: function(data, status) {
                    var results = data;
                    console.log(results);
                    var imgSrc = data.d.results[0].MediaUrl;
                    var imgElement = document.getElementById("theImage");
                    imgElement.src = imgSrc;
                    //	  imgElement.width = 200;
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert(textStatus);
                    console.log('error');
                }
            });

    function base64_encode(data) {
        console.log('encoding. here');
        // http://kevin.vanzonneveld.net
        // +   original by: Tyler Akins (http://rumkin.com)
        // +   improved by: Bayron Guevara
        // +   improved by: Thunder.m
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Pellentesque Malesuada
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Rafal Kukawski (http://kukawski.pl)
        // *     example 1: base64_encode('Kevin van Zonneveld');
        // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
        // mozilla has this native
        // - but breaks in 2.0.0.12!
        //if (typeof this.window['btoa'] == 'function') {
        //    return btoa(data);
        //}
        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            enc = "",
            tmp_arr = [];

        if (!data) {
            return data;
        }

        do { // pack three octets into four hexets
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);

            bits = o1 << 16 | o2 << 8 | o3;

            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;

            // use hexets to index into b64, and append result to encoded string
            tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        } while (i < data.length);

        enc = tmp_arr.join('');

        var r = data.length % 3;

        return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
    }
    
    
    });
