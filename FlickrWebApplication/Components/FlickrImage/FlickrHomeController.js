app.controller('FlickrHomeController', ['$scope', '$timeout', '$q', 'flickrImageServices', function ($scope, $timeout, $q, flickrImageServices) {

    var currSearchText = '';
    var isLoadingMore = false; // A flag to prevent triggering loading more multiple times by the infinite scroll plugin

    // Controller initialization
    $scope.initializeController = function () {

        $scope.currPage = 0;
        $scope.totalPage = 9999; // some large number, will get value from the API
        $scope.searchText = '';
        $scope.imgs = [];
        $scope.loading = false;
        $scope.selectedType = 'public';
        $scope.selectedImage = {};
        $scope.selectedLabel = '';
        $scope.selectedSource = '';
        $scope.isShowError = false;

        $scope.loadMore(20); // Load at least 20 pages from the flickr server
    };

    $scope.search = function () {
        $scope.currPage = 0;
        currSearchText = $scope.searchText; // update current search text
        $scope.imgs = [];

        $scope.loadMore(20); // Load at least 20 pages from the flickr server based on the curret search text
    }

    // Filtering based on image type - bind to filtering in ng-repeat
    $scope.filterImageType = function (img) {
        if ($scope.selectedType == 'public' && img.isPublic)
            return true;
        else if ($scope.selectedType == 'family' && img.isFamily)
            return true;
        else if ($scope.selectedType == 'friend' && img.isFriend)
            return true;

        return false;
    };

    $scope.selectType = function (type) {
        $scope.selectedType = type;
    };

    // Get public photos
    // This method returns a promise and the success callback will return number of image added when promise is resolved
    $scope.getPublicPhotos = function (page) {
        $scope.loading = true;

        var deferred = $q.defer();
        flickrImageServices.getPublicPhotos(page,
            function (response) { // success callback
                $scope.loading = false;

                if (response.stat == 'ok') {
                    var numImagesAdded = 0;
                    $scope.totalPage = response.photos.pages;
                    for (var i = 0; i < response.photos.photo.length; i++) {
                        if (response.photos.photo[i].title.toLowerCase().indexOf(currSearchText.toLowerCase()) > -1) {
                            $scope.imgs.push($scope.createImage(response.photos.photo[i]));
                            numImagesAdded++;
                        }
                    }

                    deferred.resolve(numImagesAdded);
                }
                else {
                    $scope.displayError();
                    deferred.reject(response);
                }


            },
            function (response) { // error callback
                $scope.loading = false;
                $scope.displayError();
                deferred.reject(response);
            }
        );

        return deferred.promise;
    };

    // Ths method is triggered when click on a particular image. It will get all the available sizes of the selected image from flickr server.
    $scope.selectImage = function (img, index) {
        $scope.selectedSource = 'img/ajax-loader.gif';
        $scope.selectedImage.id = img.id;
        $scope.selectedImage.index = index;
        $scope.selectedImage.title = img.title;

        return flickrImageServices.getSizes(img.id, getImageSizesCompleted, getImageSizesError);
    };

    // flickrImageServices.getSizes method success callback
    function getImageSizesCompleted(response) {
        if (response.stat == 'ok') {
            var isSet = false;
            $scope.selectedImage.sizes = [];

            for (var i = 0; i < response.sizes.size.length; i++) {
                var size = new Object();
                size.label = response.sizes.size[i].label;
                size.source = response.sizes.size[i].source;
                $scope.selectedImage.sizes.push(size);

                if (size.label == "Original") {
                    $scope.selectedLabel = size.label;
                    $scope.selectedSource = size.source;
                    isSet = true;
                }
            }

            // If it doesn't have Original, just select the first one to display in the modal
            if (!isSet && response.sizes.size.length > 0) {
                $scope.selectedLabel = $scope.selectedImage.sizes[0].label;
                $scope.selectedSource = $scope.selectedImage.sizes[0].source;
            }
        }
        else {
            $scope.displayError();
        }
    };

    // flickrImageServices.getSizes method error callback
    function getImageSizesError(response) {
        $scope.displayError();
    };

    $scope.setImageSize = function (size) {
        $scope.selectedSource = 'img/ajax-loader.gif';

        $timeout(function () {
            $scope.selectedLabel = size.label;
            $scope.selectedSource = size.source;
        }, 100);
    };

    // create a image model based on json data
    $scope.createImage = function (data) {
        var imgObj = new Object();
        imgObj.id = data.id;
        imgObj.title = data.title;
        imgObj.isPublic = data.ispublic;
        imgObj.isFriend = data.isfriend;
        imgObj.isFamily = data.isfamily;
        imgObj.srcLocation = 'https://farm' + data.farm + '.staticflickr.com/' + data.server + '/' + data.id + '_' + data.secret + '.jpg';
        return imgObj;
    };

    // Load more images from flickr server
    // The parameter 'leastNumImages' indicates the least of numbers of images should be loaded or load till the last page
    // This method returns a promise and will return the actual number of images are loaded from the flickr server when promise is resolved
    $scope.loadMore = function (leastNumImages) {
        var currNumImagesLoaded = 0;
        var deferred = $q.defer();

        if (isLoadingMore) {
            deferred.resolve(0);
            return deferred.promise;
        }

        isLoadingMore = true;

        function loadNextPage() {
            $scope.currPage++;
            $scope.getPublicPhotos($scope.currPage).then(
                function (numImageLoaded) {
                    currNumImagesLoaded += numImageLoaded;

                    if (currNumImagesLoaded >= leastNumImages || $scope.currPage >= $scope.totalPage) {
                        deferred.resolve(currNumImagesLoaded);
                        isLoadingMore = false;
                    }
                    else
                        loadNextPage();
                },
                function (response) {
                    deferred.reject(response);
                    isLoadingMore = false;
                }
            );
        }

        loadNextPage();

        return deferred.promise;
    };

    // Handling prev and next when viewing image in modal
    $scope.prevOrNextImage = function (prev) {
        if (!$scope.selectedImage)
            return;

        var index = -1;

        if (prev && $scope.selectedImage.index > 0)
            index = --$scope.selectedImage.index;
        else if (!prev && ($scope.selectedImage.index < $scope.imgs.length - 1 || $scope.currPage < $scope.totalPage))
            index = ++$scope.selectedImage.index;

        if (index >= 0) {
            // If it's already at the end, load more photos from flickr server
            if (index >= $scope.imgs.length) {

                // Try to load at least 20 images from the flickr server
                $scope.loadMore(20).then(function (numImagesLoaded) {

                    if (numImagesLoaded > 0)
                        $scope.selectImage($scope.imgs[index], index);

                });
            }
            else
                $scope.selectImage($scope.imgs[index], index);
        }
    };

    // Display the error block
    $scope.displayError = function () {
        $scope.isShowError = true;

        $timeout(function () {
            $scope.isShowError = false;
        }, 5000);
    }
}]);