app.factory('ajaxServices', ['$http', function ($http) {

    var ajax = {};

    ajax.ajaxGet = function (route, successFunction, errorFunction) {
        return $http({ method: 'GET', url: route }).success(function (response, status) {
            successFunction(response, status);
        }).error(function (response) {
            errorFunction(response);
        });
    };

    // TODO: implement a full set of ajax service. Eg. post, put, delete
    // Test comment
    return ajax;
}]);