// 
//   Developer : Nitisha Sharma
//   Skype Id  : nsharma111
//   File Name : my-profile.js
//   Purpose   : Shows user information, option to select profile icon, changing password and user logout.
//  
/*-------------------- MY PROFILE CONTROLLER STARTS*---------------- */


app.controller('MyProfileCtrl', function ($scope, $rootScope, $location, $ionicHistory, userService, CONSTANTS, $ionicLoading, $base64, serverAPICall, $cordovaDialogs, $cordovaSQLite, checkNetConn, $ionicPopup, deleteRecords) {

  ionic.Platform.ready(function () {
    var netCon = checkNetConn.checkConn();
    $scope.conStatus = checkNetConn.getConn();
    $scope.$on('$ionicView.enter', function () {

      var clientHeight = 105;
      var green_band_ht = $('.for_profile').height();
      var extra_space = green_band_ht - clientHeight;
      var extra_space_top = extra_space / 2;
      $(".inner-green-band").css("padding-top", extra_space_top + "px");
      $(".inner-green-band").css("padding-bottom", extra_space_top + "px");
    });

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

    $scope.showProgress = localStorage.getItem("showProgress");

    $scope.userData = [];
    $scope.userData = angular.fromJson(userService.getUserData());

    if ($scope.userData == null || $scope.userData == "undefined" || $scope.userData.usersUniqueID == "" || $scope.userData.usersUniqueID == "undefined" || $scope.userData.usersUniqueID == null) {

      $location.path("/login");
    }
    if (dbCon == 'undefined' || dbCon == '' || dbCon == null) {
      dbCon = $cordovaSQLite.openDB({ name: "wrp.db", location: "default" });
    }



    $scope.back = function () {
      $scope.backView = $ionicHistory.backView();

      $ionicHistory.goBack();

    };

    $scope.display_value = 'false';

    $scope.set_profile = function (paraVal) {
      var netCon = checkNetConn.checkConn();
      $scope.conStatus = checkNetConn.getConn();
      if ($scope.conStatus == "none") {
        $cordovaDialogs.alert('Sorry, you are offline!', 'Error', 'Ok');
        return false;
      }

      if (paraVal == 'edit') {
        $scope.display_value = 'true';

      }

    }

    $scope.update_pic = function (optionVal) {


      $scope.userData.image_option_id = optionVal;
      var data =
      {
        app_code: CONSTANTS.WRPCODE,
        usersUniqueID: $scope.userData.usersUniqueID,
        image_option_id: $scope.userData.image_option_id
      };

      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });
      $scope.data = $base64.encode(angular.toJson(data));

      serverAPICall.postRequest(CONSTANTS.UPDATEPROFILEPIC, $scope.data)
        .then(function (result) {
          $ionicLoading.hide();

          var responseStatus = result.status;
          var responseMessage = result.message;

          if (responseStatus == 'Success') {
            userService.setUserData(angular.toJson($scope.userData));
            var alertPopup = $ionicPopup.alert({
              title: ' <i class="icon ion-checkmark placeholder-icon"></i>',
              template: 'Image updated successfully.',
              buttons: [
                {
                  text: '<b>OK</b>',
                  type: 'button-green',
                }]
            });

            alertPopup.then(function (res) {

            });
            $scope.display_value = 'false';

          }
          else {
            var alertPopup = $ionicPopup.alert({
              title: ' <i class="icon ion-alert placeholder-icon"></i>',
              template: 'Check your internet connection.',
              buttons: [
                {
                  text: '<b>OK</b>',
                  type: 'button-green',
                }]
            });

            alertPopup.then(function (res) {

            });
          }
        })
    }
    $scope.cleanLS = function () {
      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });
      var query = "UPDATE users SET isLogged = ? WHERE  usersUniqueID = ?";
      $cordovaSQLite.execute(dbCon, query, ['false', $scope.userData.usersUniqueID])
        .then(function (res) {
          deleteRecords.delAssets($scope.userData.usersUniqueID).then(function (res) {
            deleteRecords.delAssetsBook($scope.userData.usersUniqueID).then(function (res) {
              $scope.userData = [];
              $ionicHistory.clearCache().then(function () {
                $ionicHistory.clearHistory();
              });
              userService.setUserData(JSON.stringify($scope.userData));

              localStorage.setItem("limitTill", 20);
              localStorage.setItem("offsetVal", 0);

              localStorage.setItem("limitTillBook", 20);
              localStorage.setItem("offsetValBook", 0);

              localStorage.setItem("assetUpdateTime", '');
              localStorage.setItem("bookUpdateTime", '');

              localStorage.setItem('downloadQueueMags', angular.toJson([]));
              localStorage.setItem('downloadQueueBooks', angular.toJson([]));
              localStorage.setItem('downloadDataMags', angular.toJson([]));
              localStorage.setItem('downloadDataBooks', angular.toJson([]));

              $ionicLoading.hide();
              $location.path("/login");
            }, function (err) {
              console.log(err);
            });
          }, function (err) {
            console.log(err);
            $ionicLoading.hide();
            $scope.userData = [];
            userService.setUserData(JSON.stringify($scope.userData));
            $location.path("/login");
          });

        }, function (err) {
        })
    }
    $scope.logout = function () {

      var confirmPopup = $ionicPopup.confirm({
        title: ' <i class="icon ion-help placeholder-icon"></i>',
        template: 'Are you sure you want to logout?',
        scope: $scope,
        buttons: [
          {
            text: '<b>Yes</b>',
            type: 'button-green',
            onTap: function (e) {
              return true;
            }
          },
          {
            text: '<b>No</b>',
            onTap: function (e) {
              return false;
            }
          }
        ]
      });
      confirmPopup.then(function (res) {
        if (res) {
          return $scope.cleanLS();
        } else {
          return false;
        }
      })

    }

  });
})

/*-------------------- MY PROFILE CONTROLLER ENDS*---------------- */