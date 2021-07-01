// 
//   Developer : Nitisha Sharma
//   Skype Id  : nsharma111
//   File Name : preview.js
//   Purpose   : Shows preview for magazine.
//  
/*-------------------- MY PROFILE CONTROLLER STARTS*---------------- */


app.controller('PreviewFullCtrl', function ($ionicPlatform, $scope, $location, $ionicHistory, userService, CONSTANTS, $ionicLoading, $base64, serverAPICall, $cordovaDialogs, $cordovaSQLite, $stateParams, $sce, checkNetConn, $rootScope, $ionicPopup) {

  ionic.Platform.ready(function () {
    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
      if (window.location.href !== '') {
        window.history.back();
      }
    }, 100);

    $scope.userData = [];
    $scope.userData = angular.fromJson(userService.getUserData());

    var netCon = checkNetConn.checkConn();
    $scope.conStatus = checkNetConn.getConn();

    $scope.$watch(function () { checkNetConn.checkConn(); return checkNetConn.getConn(); }, function (value) {

      if (value == 'none') {
        $scope.conStatus = value;
      } else {
        $scope.conStatus = value;
      }

    });

    $scope.$watch(function () { return $rootScope.errorDownloadingMag; }, function (value) {
      if (value) {
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

    $rootScope.previewChk = 1;


    if ($scope.userData == null || $scope.userData == "undefined" || $scope.userData.usersUniqueID == "" || $scope.userData.usersUniqueID == "undefined" || $scope.userData.usersUniqueID == null) {
      $location.path("/login");
    }




    var dbCon = null;

    if (dbCon == 'undefined' || dbCon == '' || dbCon == null) {
      dbCon = $cordovaSQLite.openDB({ name: "wrp.db", location: "default" });
    }

    $scope.info_arr = $stateParams.info_id;

    $scope.info_arr = $scope.info_arr.split("_");

    $scope.subtype = $scope.info_arr[0];
    $scope.magazine_id = $scope.info_arr[1];

    if ($scope.subtype == 'book') {
      $scope.book_id = $scope.magazine_id;
    }

    $scope.back = function () {
      $scope.backView = $ionicHistory.backView();
      if ($scope.backView == null || $scope.backView.backViewId == null) {
        $location.path("/tab/dash");
      }
      else {
        $ionicHistory.goBack();
      }

    };


    $scope.redirectTodashboard = function () {
      $location.path("/tab/dash");
    }

    //============== TEST FOR HISTORY START

    $scope.redirectToParent = function () {

      parent.history.back();
      return false;
    }
    $scope.redirectToFwd = function () {
      parent.history.forward();
      return false;
    }



    //============== TEST FOR HISTORY ENDS
    $scope.completMagData = [];
    $scope.testVar = '';
    $scope.previewData = '';
    $scope.mag_title = '';
    $scope.assetTemp = [];
    $scope.selectMagazine = function (magazine_id) {

      var query = "SELECT title, isPurchased, metadata, price, productCode, shopifyURL, year, unit, urlImageThumb, urlZipFile, urlToContent, latestUp, sku, magazine_id, urlImageFull,downloadPath FROM magazines WHERE magazine_id = ?";
      $cordovaSQLite.execute(dbCon, query, [magazine_id]).then(function (res) {
        if (res.rows.length > 0) {
          $scope.completMagData = res.rows.item(0);

          $scope.previewData = $scope.completMagData.urlToContent + '/index_preview.html';
          if ($scope.completMagData.title.length > 10) {
            $scope.mag_title = $scope.completMagData.title.substring(0, 15);
            $scope.mag_title = $scope.mag_title + ' ....';
          }
          else {
            $scope.mag_title = $scope.completMagData.title;
          }


          $scope.testVar = $scope.completMagData.shopifyURL;


          var asset_query = "SELECT id, usersUniqueID, asset_id, sku, version, isPurchased, downloadStatus, downloadPath FROM userAssets WHERE usersUniqueID = ? AND sku = ? AND subtype =?";
          $cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, $scope.completMagData.sku, 'magazine']).then(function (Queryres) {
            if (Queryres.rows.length > 0) {
              $scope.assetTemp = Queryres.rows.item(0);
            }
          }, function (err) {
          });

        }
      }, function (err) {
      });
    }

    $scope.selectBook = function (book_id) {

      var query = "SELECT title, isPurchased, metadata, price, productCode, shopifyURL, year, unit, urlImageThumb, urlZipFile, urlToContent, latestUp, sku, book_id, urlImageFull,downloadPath FROM books WHERE book_id = ?";
      $cordovaSQLite.execute(dbCon, query, [book_id]).then(function (res) {
        if (res.rows.length > 0) {

          $scope.completMagData = res.rows.item(0);

          $scope.previewData = $scope.completMagData.urlToContent + '/index_preview.html';
          if ($scope.completMagData.title.length > 30) {
            $scope.mag_title = $scope.completMagData.title.substring(0, 30);
            $scope.mag_title = $scope.mag_title + ' ....';
          }
          else {
            $scope.mag_title = $scope.completMagData.title;
          }


          $scope.testVar = $scope.completMagData.shopifyURL;


          var asset_query = "SELECT id, usersUniqueID, asset_id, sku, version, isPurchased, downloadStatus, downloadPath FROM userAssets WHERE usersUniqueID = ? AND sku = ? AND subtype =?";
          $cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, $scope.completMagData.sku, 'book']).then(function (Queryres) {
            if (Queryres.rows.length > 0) {
              $scope.assetTemp = Queryres.rows.item(0);
            }
          }, function (err) {
          });




        }
        else {
        }
      }, function (err) {
      });
    }



    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    }

    $scope.checkSubtype = function (val) {
      if (val == 'magazine') {
        $scope.selectMagazine($scope.magazine_id);
      }
      else if (val == 'book') {
        $scope.selectBook($scope.book_id);
      }

    }

    $scope.checkSubtype($scope.subtype);


    $scope.openurl = function (url) {
      window.open($scope.testVar, '_blank', 'hideurlbar=yes', 'closebuttoncaption=HOME');
      return false;
    }

  });
})
/*-------------------- MY PROFILE CONTROLLER ENDS*---------------- */