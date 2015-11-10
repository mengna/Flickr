app.factory('flickrImageServices', ['ajaxServices', function (ajaxServices) {

    var flickr = {};

    flickr.apiKey = 'a5e95177da353f58113fd60296e1d250';
    flickr.userId = '24662369@N07';

    flickr.getPublicPhotos = function (page, successFunction, errorFunction) {
        var api = 'https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=' + flickr.apiKey + '&user_id=' + flickr.userId + '&page=' + page + '&format=json&nojsoncallback=1';
        return ajaxServices.ajaxGet(api, successFunction, errorFunction);
    };

    flickr.getSizes = function (id, successFunction, errorFunction) {
        var api = 'https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=' + flickr.apiKey + '&photo_id=' + id + '&format=json&nojsoncallback=1';
        return ajaxServices.ajaxGet(api, successFunction, errorFunction);
    };

    return flickr;
}]);