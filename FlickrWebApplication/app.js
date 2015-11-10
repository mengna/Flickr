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

/*
app.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
      $stateProvider.state("Flickr", {
          url: "/Flickr",
          templateUrl: "/Components/FlickrImage/FlickrHome.html"
      }).
      state("Flickr.ImageDetail", {
          url: "/child",
          views: {
              "@": {
                  templateUrl: "/Components/FlickrImage/FlickrDetailImage.html"
              }
          }
      });

      $urlRouterProvider.otherwise("/Flickr");
}]);*/