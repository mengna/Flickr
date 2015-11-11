var app = angular.module("myApp", ['ngRoute', 'ngAnimate', 'infinite-scroll']);

app.config(['$routeProvider', '$routeProvider',
  function ($routeProvider, $urlRouterProvider) {
      $routeProvider.when('/', {
          templateUrl: 'Components/FlickrImage/FlickrHome.html'
      })
      .otherwise({
          redirectTo: '/'
      });
  }]);
