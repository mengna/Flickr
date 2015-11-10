// A directive to fill image in div while keeping the aspect ratio  
app.directive('resizeAspectRatio', function () {
    return {
        link: function (scope, element, attrs) {

            element.bind("load", function (e) {

                if (this.naturalHeight > this.naturalWidth)
                    this.className = "img-width";
                else
                    this.className = "img-height";
            });
        }
    }
});