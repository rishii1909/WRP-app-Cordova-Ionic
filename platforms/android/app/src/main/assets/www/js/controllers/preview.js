// 
//   Developer : Nitisha Sharma
//   Skype Id  : nsharma111
//   File Name : preview.js
//   Purpose   : Shows preview for magazine.
//  
/*-------------------- MY PROFILE CONTROLLER STARTS*---------------- */


app.controller('PreviewCtrl', function ($scope, $location, $ionicHistory, userService, CONSTANTS, $ionicLoading, $base64, serverAPICall, $cordovaDialogs, $cordovaSQLite, $stateParams, $window, checkNetConn) {

  ionic.Platform.ready(function () {
    $scope.userData = [];
    $scope.userData = angular.fromJson(userService.getUserData());

    var netCon = checkNetConn.checkConn();
    $scope.conStatus = checkNetConn.getConn();

    var dbCon = null;
    if (dbCon == 'undefined' || dbCon == '' || dbCon == null) {
      dbCon = $cordovaSQLite.openDB({ name: "wrp.db", location: "default" });
    }
    if ($scope.userData == null || $scope.userData == "undefined" || $scope.userData.usersUniqueID == "" || $scope.userData.usersUniqueID == "undefined" || $scope.userData.usersUniqueID == null) {

      $location.path("/login");
    }
    $scope.showSpinner = 'true';
    $scope.magazine_id = $stateParams.magazine_id;

    $scope.back = function () {
      $scope.backView = $ionicHistory.backView();
      if ($scope.backView == null || $scope.backView.backViewId == null) {
        $location.path("/tab/dash");
      }
      else {
        $ionicHistory.goBack();
      }
    };
    $scope.testVar = '';
    $scope.completMagData = [];
    $scope.selectMagazine = function (magazine_id) {
      var query = "SELECT title, isPurchased, metadata, price, productCode, shopifyURL, year, unit, urlImageThumb, urlZipFile, urlToContent, latestUp, sku, magazine_id, urlImageFull FROM magazines WHERE magazine_id = ?";
      $cordovaSQLite.execute(dbCon, query, [magazine_id]).then(function (res) {
        if (res.rows.length > 0) {
          $scope.completMagData.push(res.rows.item(0));
          $scope.completMagData = $scope.completMagData[0];
          $scope.testVar = $scope.completMagData.shopifyURL;
        }
        else {
          console.log("No results found");
        }
      }, function (err) {
        console.error(err);
      });
    }
    $scope.selectMagazine($scope.magazine_id);
    $scope.openurl = function (url) {
      var inAppBrowserbRef = window.open($scope.testVar, '_blank', 'hideurlbar=yes', 'closebuttoncaption=HOME');
      inAppBrowserbRef.addEventListener('loadstart', inAppBrowserbLoadStart);
      inAppBrowserbRef.addEventListener('loadstop', inAppBrowserbLoadStop);

      function inAppBrowserbLoadStart(event) {

        navigator.notification.activityStart("Please Wait", "Page is loading....");

      }

      function inAppBrowserbLoadStop(event) {
        navigator.notification.activityStop();
      }

      return false;
    }

  });
})

/*-------------------- MY PROFILE CONTROLLER ENDS*---------------- */