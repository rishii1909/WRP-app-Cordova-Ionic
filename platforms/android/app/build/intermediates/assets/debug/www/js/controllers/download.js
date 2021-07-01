// 
//   Developer : Nitisha Sharma
//   Skype Id  : nsharma111
//   File Name : download.js
//   Purpose   : For viewing downloads
//  
/*-------------------- DOWNLOAD CONTROLLER STARTS*---------------- */


app.controller('DownloadCtrl', function ($scope, $location, $ionicHistory, userService, CONSTANTS, $ionicLoading, $base64, serverAPICall, $cordovaDialogs, $cordovaSQLite, checkNetConn, $state, $cordovaFile, $cordovaFileTransfer, setUpdateTime, $interval, $ionicPopup, $timeout, $rootScope, checkRecords, manageRecords, selectCommonRecordsBook, $ionicScrollDelegate, downloadAsset) {

  ionic.Platform.ready(function () {
    $scope.conStatus = '';
    $scope.downloadCount = 0;
    $scope.resVal = 0;

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

    $scope.$on("$ionicView.enter", function (scopes, states) {

      // Check for pending downloads in local storage starts here
      var downloadQueueMags = angular.fromJson(localStorage.getItem('downloadQueueMags'));
      var downloadQueueBooks = angular.fromJson(localStorage.getItem('downloadQueueBooks'));
      $rootScope.downloadDataMags = angular.fromJson(localStorage.getItem('downloadDataMags'));
      $rootScope.downloadDataBooks = angular.fromJson(localStorage.getItem('downloadDataBooks'));

      var progressDivMags = angular.fromJson(localStorage.getItem('progressDivMags'));
      var progressDivBooks = angular.fromJson(localStorage.getItem('progressDivBooks'));

      if (progressDivMags == true || progressDivBooks == true) {
        $scope.showProgress = true;
        localStorage.setItem("showProgress", $scope.showProgress);
      } else {
        $scope.showProgress = localStorage.getItem("showProgress");
      }

      if (downloadQueueMags.length > 0 && !progressDivMags) {
        let downloadId = downloadQueueMags[0];
        let index = $rootScope.downloadDataMags.findIndex(function (item, i) {
          return item.asset_id == downloadId;
        })
        var downloadData = $rootScope.downloadDataMags[index];
        if (!downloadData.isUpdating) {
          localStorage.setItem('progressDivMags', true);
          $scope.showProgress = true;
        }
        downloadAsset.downloadMagazine(downloadData.id, downloadData.srcUrl, downloadData.asset_id, downloadData.version, downloadData.thumbnail, downloadData.indexVal, downloadData.forArray, $scope.userData.usersUniqueID, 'magazine', downloadData.title, downloadData.isUpdating, downloadData.oldData);
      }

      if (downloadQueueBooks.length > 0 && !progressDivBooks) {
        let downloadId = downloadQueueBooks[0];
        let index = $rootScope.downloadDataBooks.findIndex(function (item, i) {
          return item.asset_id == downloadId;
        })
        var downloadData = $rootScope.downloadDataBooks[index];
        if (!downloadData.isUpdating) {
          localStorage.setItem('progressDivBooks', true);
          $scope.showProgress = true;
        }
        downloadAsset.downloadMagazine(downloadData.id, downloadData.srcUrl, downloadData.asset_id, downloadData.version, downloadData.thumbnail, downloadData.indexVal, downloadData.forArray, $scope.userData.usersUniqueID, 'book', downloadData.title, downloadData.isUpdating, downloadData.oldData);
      }
      // Check for pending downloads in local storage starts here

      if (downloadQueueMags.length == 0 || downloadQueueBooks.length == 0) {
        localStorage.setItem("showProgress", false);
      }
    });

    $scope.showProgress = localStorage.getItem("showProgress");

    $scope.updateAvailableMags = angular.fromJson(localStorage.getItem('updateAvailableMags'));
    $scope.updateAvailableBooks = angular.fromJson(localStorage.getItem('updateAvailableBooks'));

    $scope.checkDownloaded = function () {

      $scope.userAssetData = [];
      $scope.userData = angular.fromJson(userService.getUserData());
      var demoQuery = "SELECT asset_id,subtype,sku FROM userAssets WHERE usersUniqueID = ?";
      $cordovaSQLite.execute(dbCon, demoQuery, [$scope.userData.usersUniqueID]).then(function (Demores) {
        if (Demores.rows.length > 0) {
          for (var i = 0; i < Demores.rows.length; i++) {
            $scope.userAssetData.push(Demores.rows.item(i));
          }

          $scope.downloadCount = Demores.rows.length;

          $scope.oldDownloadCount = localStorage.getItem("downloadCount");

          if ($scope.downloadCount > $scope.oldDownloadCount || $scope.downloadCount < $scope.oldDownloadCount) {
            localStorage.setItem("downloadCount", $scope.downloadCount);
          }

        }

      }, function (err) {
      });
    }
    $scope.checkDownloaded();

    var netCon = checkNetConn.checkConn();
    $scope.conStatus = checkNetConn.getConn();

    $scope.userData = [];
    $scope.userData = angular.fromJson(userService.getUserData());
    if ($scope.userData == null || $scope.userData == "undefined" || $scope.userData.usersUniqueID == "" || $scope.userData.usersUniqueID == "undefined" || $scope.userData.usersUniqueID == null) {
      $location.path("/login");
    }
    if (dbCon == 'undefined' || dbCon == '' || dbCon == null) {
      dbCon = $cordovaSQLite.openDB({ name: "wrp.db", location: "default" });
    }

    $scope.getDownloads = function (val) {
      if (val == 'magazine') {

        var selectQuery = "SELECT a.id, a.asset_id, a.subtype, a.sku, m.title, a.version, m.version, a.downloadPath, a.downloadStatus, a.coverPath FROM userAssets a, magazines m WHERE a.asset_id=m.magazine_id AND a.subtype = 'magazine' AND a.usersUniqueID = ? ORDER BY a.id DESC";
        $cordovaSQLite.execute(dbCon, selectQuery, [$scope.userData.usersUniqueID]).then(function (res) {
          $scope.downloadedMagData = [];
          if (res.rows.length > 0) {
            $scope.downloadedMagData = [];
            for (var i = 0; i < res.rows.length; i++) {
              $scope.downloadedMagData.push(res.rows.item(i));
            }
          }
          else {
            $scope.downloadedMagData = [];
            $scope.resVal = 1;
          }
        }, function (err) {

        });
      }
      else {

        var selectQuery = "SELECT a.id, a.asset_id, a.subtype, a.sku, b.title, a.version, a.downloadPath, a.downloadStatus, a.coverPath FROM userAssets a, books b WHERE a.asset_id=b.book_id AND a.subtype = 'book' AND a.usersUniqueID = ? ORDER BY a.id DESC";
        $cordovaSQLite.execute(dbCon, selectQuery, [$scope.userData.usersUniqueID]).then(function (response) {
          if (response.rows.length > 0) {
            $scope.downloadedBookData = [];
            for (var i = 0; i < response.rows.length; i++) {
              $scope.downloadedBookData.push(response.rows.item(i));
            }
          }
          else {
            $scope.downloadedBookData = [];
            $scope.resVal = 2;
          }
        }, function (error) {

        });
      }

    }

    $scope.getDownloads('magazine');
    $scope.getDownloads('book');

    $scope.downloadedData = [];


    $scope.back = function () {
      $scope.backView = $ionicHistory.backView();
      if ($scope.backView == null || $scope.backView.backViewId == null) {
        $location.path("/tab/dash");
      }
      else {
        $ionicHistory.goBack();
      }
    };

    $scope.scrolltoTop = function () {
      $ionicScrollDelegate.scrollTop();
    }

    $scope.deleteAsset = function (sku, asset_id, version, subtype) {
      var sku, asset_id, version;
      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });

      sku = sku;
      asset_id = asset_id;
      version = version;
      var asset_query = "DELETE FROM userAssets WHERE usersUniqueID =? AND asset_id = ? AND sku = ? AND version =? AND subtype =?";
      $cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, asset_id, sku, version, subtype])
        .then(function (res) {
          $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_' + sku).then(function (result) {
            if (subtype == 'magazine') {
              var assetName = 'Magazine';
            }
            else {
              var assetName = 'Book';
            }
            var alertPopup = $ionicPopup.alert({
              title: ' <i class="icon ion-checkmark placeholder-icon"></i>',
              template: assetName + ' removed from downloads.',
              buttons: [
                {
                  text: '<b>OK</b>',
                  type: 'button-green',
                }]
            });

            alertPopup.then(function (res) {

              if (subtype == 'magazine') {
                $rootScope.refreshCheckMagazine = 2;
              }
              else if (subtype == 'book') {
                $rootScope.refreshCheckBook = 2;
              }

              $scope.getDownloads(subtype);

              $state.reload();

            });
            $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) {

            }, function (err) {
            })

            $ionicLoading.hide();


          }, function (err) {
          });

      }, function (error) {
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
          title: ' <i class="icon ion-alert placeholder-icon"></i>',
          template: 'Problem in deleting ' + subtype + ' from downloads, try after sometime.',
          buttons: [
            {
              text: '<b>OK</b>',
              type: 'button-green',
            }]
        });

        alertPopup.then(function (res) {


        });
      });
    }

    $scope.undoDelete = function (sku, asset_id, version, subtype) {
      var sku = sku;
      var asset_id = asset_id;
      var version = version;
      var subtype = subtype;

      //----------------------- Insert into Userassets for downloads in database =============

      var confirmPopup = $ionicPopup.confirm({
        title: ' <i class="icon ion-alert placeholder-icon"></i>',
        template: 'Are you sure you want to delete?',
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
        if (res == true) {

          $scope.deleteAsset(sku, asset_id, version, subtype);
        }
      })
      //----------------------- Updating Status of downloads in database ends=============

    }

    $scope.showUpdateAlert = function (assetVal) {
      var alertPopup = $ionicPopup.alert({
        title: ' <i class="icon ion-alert placeholder-icon update-icon"></i>',
        template: assetVal + ' has update available, to get latest version please delete and re-download.',
        buttons: [
          {
            text: '<b>OK</b>',
            type: 'button-green',
          }]
      });
      alertPopup.then(function (res) {

      });
    }

  });

});

/*-------------------- DOWNLOAD CONTROLLER ENDS*---------------- */