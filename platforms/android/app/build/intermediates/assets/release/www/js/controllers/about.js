
//   Developer : Nitisha Sharma
//   Skype Id  : nsharma111
//   File Name : about.js
//   Purpose   : To view the app info and Read Terms of service, Privacy policy when the user is logged in.

/*-------------------- DASHBOARD CONTROLLER STARTS*--------------*/

app.controller('AboutCtrl', function ($scope, userService, $location, $ionicHistory, checkNetConn, $rootScope, $ionicPopup) {

    ionic.Platform.ready(function () {
        $scope.userData = [];
        $scope.userData = angular.fromJson(userService.getUserData());
        var netCon = checkNetConn.checkConn();
        $scope.conStatus = checkNetConn.getConn();

        $scope.$watch(function () { checkNetConn.checkConn(); return checkNetConn.getConn(); }, function (value) {
            if (value == 'none') {
                $scope.conStatus = value;
                $scope.progressDiv = false;
                $scope.showProgress = false;
            } else {
                $scope.conStatus = value;
            }
        });

        $scope.$watch(function () { return $rootScope.errorDownloadingMag; }, function (value) {
            if (value) {
                $scope.progressDiv = false;
                $scope.showProgress = false;

                var alertPopup = $ionicPopup.alert({
                    title: ' <i class="icon ion-alert placeholder-icon"></i>',
                    template: 'Problem in downloading your magazine, check your internet connection.',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-green',
                        }]
                });
                alertPopup.then(function (res) {

                });
                $rootScope.errorDownloadingMag = false;
            }
        });

        $scope.$watch(function () { return $rootScope.errorDownloadingBook; }, function (value) {
            if (value) {
                $scope.progressDiv = false;
                $scope.showProgress = false;

                var alertPopup = $ionicPopup.alert({
                    title: ' <i class="icon ion-alert placeholder-icon"></i>',
                    template: 'Problem in downloading your book, check your internet connection.',
                    buttons: [
                        {
                            text: '<b>OK</b>',
                            type: 'button-green',
                        }]
                });
                alertPopup.then(function (res) {

                });
                $rootScope.errorDownloadingBook = false;
            }
        });

        if ($scope.userData == null || $scope.userData == "undefined" || $scope.userData.usersUniqueID == "" || $scope.userData.usersUniqueID == "undefined" || $scope.userData.usersUniqueID == null) {

            $location.path("/login");
        }

        $scope.showProgress = localStorage.getItem("showProgress");

        $scope.$on("$ionicView.enter", function (scopes, states) {
            $scope.showProgress = localStorage.getItem("showProgress");
        });

    });
})
