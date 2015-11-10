app.controller('FlickrHomeController', ['$scope', '$timeout', 'flickrImageServices', function ($scope, $timeout, flickrImageServices) {

    var currPage = 1;
    var totalPage = 1;

    // Controller initialization
    $scope.initializeController = function () {
        $scope.totalPhotos = 1;
        $scope.imgs = [];
        $scope.loading = false;
        $scope.selectedType = 'public';
        $scope.filterText = '';
        $scope.isInfniteScrollDisabled = false;
        $scope.selectedImage = {};
        $scope.selectedLabel = '';
        $scope.selectedSource = '';
        $scope.isShowError = false;
        $scope.getPublicPhotos(currPage);
    };

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
    $scope.getPublicPhotos = function (page) {
        $scope.loading = true;
        $scope.isInfniteScrollDisabled = true;
        return flickrImageServices.getPublicPhotos(page, $scope.getPublicPhotosCompleted, $scope.getPublicPhotosError);
    };

    // flickrImageServices.getPublicPhotos method success callback
    $scope.getPublicPhotosCompleted = function (response) {
        $scope.loading = false;

        if (response.stat == 'ok') {
            totalPage = response.photos.pages;
            $scope.totalPhotos = response.photos.total;
            for (var i = 0; i < response.photos.photo.length; i++)
                $scope.imgs.push($scope.createImage(response.photos.photo[i]));

        }
        else {
            $scope.displayError();
        }

        $scope.isInfniteScrollDisabled = false;
    };
    
    // flickrImageServices.getPublicPhotos method error callback
    $scope.getPublicPhotosError = function (response) {
        $scope.loading = false;
        $scope.isInfniteScrollDisabled = false;
        $scope.displayError();
    };

    // Ths method is triggered when click on a particular image. It will get all the available sizes of the selected image from flickr server.
    $scope.selectImage = function (img, index) {
        $scope.selectedSource = 'img/ajax-loader.gif';
        $scope.selectedImage.id = img.id;
        $scope.selectedImage.index = index;
        $scope.selectedImage.title = img.title;

        return flickrImageServices.getSizes(img.id, $scope.getImageSizesCompleted, $scope.getImageSizesError);
    };

    // flickrImageServices.getSizes method success callback
    $scope.getImageSizesCompleted = function (response) {
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
    $scope.getImageSizesError = function (response) {
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
    $scope.loadMore = function () {
        if (currPage < totalPage)
        {
            currPage++;
            return $scope.getPublicPhotos(currPage);
        }

        return null;
    };

    // Handling prev and next when viewing image in modal
    $scope.prevOrNextImage = function (prev) {
        if (!$scope.selectedImage)
            return;

        var index = -1;
        
        if (prev && $scope.selectedImage.index > 0)
            index = --$scope.selectedImage.index;
        else if (!prev && $scope.selectedImage.index < $scope.totalPhotos - 1)
            index = ++$scope.selectedImage.index;

        if (index >= 0) {
            // If it's already at the end, load more photos from flickr server
            if (index >= $scope.imgs.length) {
                var promise = $scope.loadMore();
                if (promise) {
                    promise.success(function () {
                        $scope.selectImage($scope.imgs[index], index);
                    });
                }
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