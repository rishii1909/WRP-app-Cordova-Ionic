app.controller('MagazineCtrl', function ($scope, $ionicPlatform, serverAPICall, $base64, CONSTANTS, $http, $location, userService, $ionicLoading, $ionicHistory, $cordovaDialogs, $rootScope, $ionicModal, $cordovaSQLite, $q, $cordovaFile, $cordovaFileTransfer, manageRecords, selectRecords, checkRecords, deleteRecords, setUpdateTime, $interval, checkNetConn, $state, $ionicPopup, $timeout, selectCommonRecords, downloadAsset, $cordovaToast, $ionicScrollDelegate, $compile) {
  ionic.Platform.ready(function () {
    document.addEventListener("resume", onResume, false);
    $scope.updateAvailable = [];
    $scope.showLoad = 0;
    $scope.downloadQueue = angular.fromJson(localStorage.getItem('downloadQueueMags'));
    $rootScope.downloadDataMags = angular.fromJson(localStorage.getItem('downloadDataMags'));

    function onResume() {
      var resumed = 0;
      $scope.displayData($scope.offsetVal);
      // Handle the resume event
    }

    $scope.$watch(function () {
      checkNetConn.checkConn();
      return checkNetConn.getConn();
    }, function (value) {
      var refreshStatus = angular.fromJson(localStorage.getItem('magazinesRefreshed'));
      if (value == 'none') {
        $scope.conStatus = value;
        $scope.progressDiv = false;
        $scope.showProgress = false;

        document.getElementById("pageHeading").innerHTML = "My Downloads";

        // If data is not refreshed show alert
        if (refreshStatus != null && !refreshStatus) {
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
            title: ' <i class="icon ion-alert placeholder-icon"></i>',
            template: 'Connection lost, magazines will be refreshed once connected.',
            buttons: [{
              text: '<b>OK</b>',
              type: 'button-green',
            }]
          });
          alertPopup.then(function (res) { });
          // Close popup after 5 seconds
          setTimeout(function () {
            alertPopup.close();
          }, 5000);
        }

        $scope.$broadcast('scroll.refreshComplete');
      } else {
        $scope.conStatus = value;

        var template = `<div class="float-l">My Downloads</div><div class="move_available_container">
          <button id="move_btn" ng-click="jumpToAvailable()">
						<span>
							<img src="img/header-back.jpg" id="move_down_arrow"/>
						</span>
            <span>Available Issues</span>
          </button>
        </div>`;
        angular.element(document.getElementById("pageHeading")).html($compile(template)($scope));
        // If data is not refreshed refresh data now.
        if (refreshStatus != null && !refreshStatus) {
          $scope.refreshData();
        }
        $scope.downloadQueue = angular.fromJson(localStorage.getItem('downloadQueueMags'));
        $scope.showProgressiveImage();
      }
    });

    $scope.$watch(function () {
      return $rootScope.errorDownloadingMag;
    }, function (value) {
      if (value) {
        $scope.progressDiv = false;
        $scope.showProgress = false;

        var alertPopup = $ionicPopup.alert({
          title: ' <i class="icon ion-alert placeholder-icon"></i>',
          template: 'Problem in downloading your magazine, check your internet connection.',
          buttons: [{
            text: '<b>OK</b>',
            type: 'button-green',
          }]
        });
        alertPopup.then(function (res) { });
        // Close popup after 5 seconds
        setTimeout(function () {
          alertPopup.close();
        }, 5000);
        $rootScope.errorDownloadingMag = false;
      }
    });

    $scope.$watch(function () {
      return $rootScope.errorDownloadingBook;
    }, function (value) {
      if (value) {
        $scope.progressDiv = false;
        $scope.showProgress = false;

        var alertPopup = $ionicPopup.alert({
          title: ' <i class="icon ion-alert placeholder-icon"></i>',
          template: 'Problem in downloading your book, check your internet connection.',
          buttons: [{
            text: '<b>OK</b>',
            type: 'button-green',
          }]
        });
        alertPopup.then(function (res) { });
        // Close popup after 5 seconds
        setTimeout(function () {
          alertPopup.close();
        }, 5000);
        $rootScope.errorDownloadingBook = false;
      }
    });

    $scope.total_records_magazines = localStorage.getItem("total_records_magazines");
    $scope.resultText = 0;

    $scope.checkForUpdate = function () {
      $scope.updateAvailable = [];

      if ($scope.tempArrayDwn) {
        if ($scope.tempArrayDwn.length > 0) {
          for (var i = 0; i < $scope.tempArrayDwn.length; i++) {
            for (var j = 0; j < $scope.dashboardMyData.length; j++) {
              if ($scope.tempArrayDwn[i].asset_id == $scope.dashboardMyData[j].magazine_id) {
                if ($scope.tempArrayDwn[i].version < $scope.dashboardMyData[j].version) {
                  if ($scope.updateAvailable.indexOf($scope.dashboardMyData[j].magazine_id) == -1) {
                    $scope.updateAvailable.push($scope.dashboardMyData[j].magazine_id);
                  }
                }
              }
            }
          }
          localStorage.setItem('updateAvailableMags', angular.toJson($scope.updateAvailable));
          if (($scope.updateAvailable.length > 0) && ($scope.conStatus != "none")) {
            $scope.autoUpdate();
          }
        }
      }
    }

    $scope.checkDownloads = function () {
      $scope.magDownloads = 0;
      $scope.showLoad = 0;
      var asset_query = "SELECT id, usersUniqueID, asset_id,subtype, version FROM userAssets WHERE usersUniqueID = ? AND downloadStatus = ? AND subtype=?";
      $cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, true, 'magazine']).then(function (Queryres) {
        $scope.showLoad = 1;
        if (Queryres.rows.length > 0) {
          $scope.tempArrayDwn = [];
          $scope.magDownloads = Queryres.rows.length;
          for (var i = 0; i < Queryres.rows.length; i++) {
            $scope.tempArrayDwn.push(Queryres.rows.item(i));
          }

        } else {
          $scope.magDownloads = 0;
        }

        if ($scope.timeToLoadImages()) {
          $scope.showProgressiveImage();
        }
      }, function (err) { });

    }
    // THIS IS TO GET COMPLETE DATA 412 RECORDS AT ONCE ============
    $scope.getAllMagazineData = function () {
      $scope.total_records_magazines = localStorage.getItem("total_records_magazines");
      $scope.allMagazines = [];

      selectCommonRecords.getAllMagazines($scope.userData.usersUniqueID, 0, $scope.total_records_magazines)
        .then(function (result) {
          $scope.allMagazines = result;
          $scope.checkForUpdate();
          $scope.removeUnpurchased($scope.allMagazines);
        });
    }

    $scope.timeToLoadImages = function () {
      var lastUpdateTime = localStorage.getItem("assetUpdateTime");
      var thisTime = Date.now();

      if (lastUpdateTime == null) {
        return true;
      }

      var timeElapsed = (thisTime - lastUpdateTime) / 1000;
      var timeElapsed = Math.round(timeElapsed);

      $scope.refreshCheck = $rootScope.refreshCheckMagazine;
      if ($scope.refreshCheck == 2 && timeElapsed < 200) {
        return true;
      } else {
        return false;
      }
    }

    $scope.removeUnpurchased = function (dataToCompare) {
      // Check for downloaded data from API's data
      var downloadedData = [];

      var asset_query = "SELECT id, sku, usersUniqueID, asset_id, subtype, version, isPurchased FROM userAssets WHERE usersUniqueID = ? AND downloadStatus = ? AND subtype=?";
      $cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, true, 'magazine']).then(function (Queryres) {
        for (var i = 0; i < Queryres.rows.length; i++) {
          downloadedData.push(Queryres.rows.item(i));
          let index = dataToCompare.findIndex(function (value, index) {
            return value.sku == downloadedData[i].sku;
          })
          if (index != -1) {
            if (downloadedData[i].isPurchased.toString() != dataToCompare[index].isPurchased.toString()) {
              let data = downloadedData[i];
              var asset_query = "DELETE FROM userAssets WHERE usersUniqueID =? AND asset_id = ? AND sku = ? AND subtype =?";
              $cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, data.asset_id, data.sku, data.subtype]).then(function (res_query) {
                $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', data.subtype + '_' + data.sku).then(function (result) {
                  $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', data.subtype + '_cover_' + data.sku).then(function (res) {
                    $rootScope.no_of_magazine_updated = 1;
                    $ionicHistory.clearCache($state.current.name).then(function () {
                      $ionicHistory.clearHistory();
                      $state.reload();
                    });
                  });
                })
              }, function (error) { });
            }
          }
        }
      });
    }

    $scope.$on("$ionicView.enter", function (scopes, states) {
      var refreshStatus = angular.fromJson(localStorage.getItem('magazinesRefreshed'));
      if (refreshStatus != null && !refreshStatus) {
        $scope.refreshData();
      }

      // Check for pending updates in local storage starts here
      var updateQueueMags = angular.fromJson(localStorage.getItem('updateQueueMags'));
      var updateQueueBooks = angular.fromJson(localStorage.getItem('updateQueueBooks'));

      $rootScope.updateDataMags = angular.fromJson(localStorage.getItem('updateDataMags'));
      $rootScope.updateDataBooks = angular.fromJson(localStorage.getItem('updateDataBooks'));

      var progressDivMags = angular.fromJson(localStorage.getItem('updateProgressDivMags'));
      var progressDivBooks = angular.fromJson(localStorage.getItem('updateProgressDivBooks'));

      let magsDownloading = angular.fromJson(localStorage.getItem('progressDivMags'));
      let booksDownloading = angular.fromJson(localStorage.getItem('progressDivBooks'));

      if (magsDownloading == true || booksDownloading == true) {
        $scope.showProgress = true;
        localStorage.setItem("showProgress", $scope.showProgress);
      } else {
        $scope.showProgress = localStorage.getItem("showProgress");
      }

      if (updateQueueMags.length > 0 && !progressDivMags && !progressDivBooks) {
        var downloadData = $rootScope.updateDataMags[0];
        progressDivMags = true;
        localStorage.setItem('updateProgressDivMags', true);
        downloadAsset.downloadMagazine(downloadData.id, downloadData.srcUrl, downloadData.asset_id, downloadData.version, downloadData.thumbnail, downloadData.indexVal, downloadData.forArray, $scope.userData.usersUniqueID, 'magazine', downloadData.title, downloadData.isUpdating, downloadData.oldData);
      }

      if (updateQueueBooks.length > 0 && !progressDivBooks && !progressDivMags) {
        var downloadData = $rootScope.updateDataBooks[0];
        progressDivBooks = true;
        localStorage.setItem('updateProgressDivBooks', true);
        downloadAsset.downloadMagazine(downloadData.id, downloadData.srcUrl, downloadData.asset_id, downloadData.version, downloadData.thumbnail, downloadData.indexVal, downloadData.forArray, $scope.userData.usersUniqueID, 'book', downloadData.title, downloadData.isUpdating, downloadData.oldData);
      }
      // Check for pending updates in local storage ends here

      $scope.downloadQueue = angular.fromJson(localStorage.getItem('downloadQueueMags'));
      if ($scope.userData == null || $scope.userData == "undefined" || $scope.userData.usersUniqueID == "" || $scope.userData.usersUniqueID == "undefined" || $scope.userData.usersUniqueID == null) {
        $location.path("/login");
      } else {
        $location.path("/tab/dash");
      }

      $scope.progressDiv = angular.fromJson(localStorage.getItem('progressDivMags'));

      //after download code starts
      $scope.showProgress = localStorage.getItem("showProgress");

      if ($rootScope.no_of_magazine_updated == 1) {

        $scope.userData = angular.fromJson(userService.getUserData());

        $scope.offsetVal = parseInt(localStorage.getItem("offsetVal"));

        var offsetVal = 0;
        var limitTill = $scope.offsetVal + $scope.limitTill;

        $scope.checkDownloads();

        $ionicLoading.show({
          template: CONSTANTS.SPINNER
        });



        selectCommonRecords.getAllMagazines($scope.userData.usersUniqueID, offsetVal, limitTill)
          .then(function (result) {
            $rootScope.no_of_magazine_updated = 0;
            $scope.progressDiv = angular.fromJson(localStorage.getItem("showProgress"));
            $scope.dashboardMyData = [];
            $scope.dashboardAvailData = [];
            $scope.showLoad = 1;
            for (var i = 0; i < result.length; i++) {
              if (result[i].isPurchased == "true") {
                $scope.dashboardMyData.push(result[i]);
              } else {
                $scope.dashboardAvailData.push(result[i]);
              }

            }

            if ($scope.dashboardMyData.length > 0) {
              $scope.resultText = 1;
            }
            $rootScope.refreshCheckMagazine = 0;
            $scope.updateData = 0;
            $ionicLoading.hide();

          }, function (err) { });
        $scope.spinVal = 0;

      }

      ////////////////// after download code ends

      $scope.conStatus = checkNetConn.getConn();
      $scope.limitTill = localStorage.getItem("limitTill");
      $scope.offsetVal = angular.fromJson(localStorage.getItem("offsetVal"));

      var lastUpdateTime = localStorage.getItem("assetUpdateTime");
      var thisTime = Date.now();

      var timeElapsed = (thisTime - lastUpdateTime) / 1000;
      var timeElapsed = Math.round(timeElapsed);


      $scope.checkDownloads();

      //----- Check for  back from preview page ------------

      if ($rootScope.previewChk != 1) {
        $scope.getAllMagazineData();
      } else {
        $rootScope.previewChk = 0;
      }


      //------- Check for any change in search page -------

      $scope.refreshCheck = $rootScope.refreshCheckMagazine;
      if ($scope.refreshCheck == 2 && timeElapsed < 200) {
        var offsetValChanged = localStorage.setItem("offsetVal", 0);
        $scope.offsetVal = localStorage.getItem("offsetVal");
        $scope.displayData($scope.offsetVal);
      }

      $scope.getAllData = function () {

        $scope.resultText = 0;
        $rootScope.refreshCheckMagazine = 0;
        $scope.showLoad = 0;
        var lastUpdateTime = localStorage.getItem("assetUpdateTime");
        if (lastUpdateTime == null || lastUpdateTime == '') {
          $ionicLoading.show({
            template: CONSTANTS.SPINNER
          });
        }

        // INSERT INTO DB AFTER 5 MINUTES

        manageRecords.setAssets($scope.userData.usersUniqueID)
          .then(function (result) {
            $scope.total_records_magazines = localStorage.getItem("total_records_magazines");
            $timeout(function () {
              if ($scope.offsetVal == 0) {
                var newLimit = parseInt($scope.limitTill) + parseInt($scope.offsetVal);
              } else if ($scope.offsetVal > 0) {
                var newLimit = parseInt($scope.offsetVal);
              }

              // SELECT FROM DB AFTER 5 MINUTES
              selectCommonRecords.getAllMagazines($scope.userData.usersUniqueID, 0, newLimit)
                .then(function (result) {
                  $scope.dashboardMyData = [];
                  $scope.dashboardAvailData = [];
                  $scope.showLoad = 1;

                  $ionicHistory.clearCache($state.current.name).then(function () {
                    $ionicHistory.clearHistory();
                  });

                  for (var i = 0; i < result.length; i++) {
                    if (result[i].isPurchased == "true") {
                      if ($scope.dashboardMyData.indexOf(result[i]) == -1) {
                        $scope.dashboardMyData.push(result[i]);
                      }
                    } else {
                      if ($scope.dashboardAvailData.indexOf(result[i]) == -1) {
                        $scope.dashboardAvailData.push(result[i]);
                      }
                    }

                  }

                  $scope.showProgressiveImage();
                  if ($scope.dashboardMyData.length > 0) {
                    $scope.resultText = 1;
                  }
                  $ionicLoading.hide();
                });

              $scope.getAllMagazineData();
            }, 2500);
          });
        // INSERT LIST INTO DB AFTER 5 MINUTES
        manageRecords.setAssetsList($scope.userData.usersUniqueID)
          .then(function (res) {
            $scope.magazineList = [];

            // SELECT LIST FROM DB AFTER 5 MINUTES
            selectRecords.getAssetsList()
              .then(function (result) {
                $scope.magazineList = result;

              });
          });


      }



      if (timeElapsed > 200 && $scope.conStatus != "none") {
        // DELETE RECORDS FROM MAGAZINE IF MORE THAN 3 MINUTES
        deleteRecords.delAssets($scope.userData.usersUniqueID).then(function (res) {
          deleteRecords.delAssetsList($scope.userData.usersUniqueID).then(function (result) {
            $scope.getAllData();
          });
        });
      }


    });

    var netCon = checkNetConn.checkConn();
    var thisTime;
    $scope.userData = [];
    $scope.userData = angular.fromJson(userService.getUserData());

    $scope.conStatus = checkNetConn.getConn();

    $scope.total_records_magazines = localStorage.getItem("total_records_magazines");
    $scope.progressDiv = false;
    $scope.magDownloads = 1;
    $scope.flag = false;
    $scope.filterOn = false;
    $scope.sortOn = false;
    $scope.searchStatus = 0;
    $scope.dwnStatus = "false";
    $scope.magazineList = [];
    $scope.dashboardMyData = [];
    $scope.dashboardAvailData = [];
    $scope.spinVal = 0;
    $scope.allMagazines = [];
    $scope.updateData = 0;
    $scope.showLoad = 0;

    var lastUpdateTime = localStorage.getItem("assetUpdateTime");
    $scope.limitTill = localStorage.getItem("limitTill");

    $scope.offsetVal = localStorage.getItem("offsetVal");

    $scope.total_records_magazines = localStorage.getItem("total_records_magazines");

    $scope.checkDownloads();

    manageRecords.getMagazinesData($scope.userData.usersUniqueID).then(function (result) {
      $scope.removeUnpurchased(result);
    }, function (error) { });

    //======= FOR COMMON DATA START================

    $scope.displayData = function (offsetVal) {

      var dataLength = parseInt($scope.dashboardMyData.length) + parseInt($scope.dashboardAvailData.length);

      if ((offsetVal == 0 && dataLength == 0) || $scope.updateData == 1 || $scope.refreshCheck == 2 || resumed == 0) {
        resumed = 1;
        if ($scope.refreshCheck != 2 || $rootScope.refreshCheckMagazine != 2) {
          $ionicLoading.show({
            template: CONSTANTS.SPINNER
          });
        }

        $scope.showLoad = 0;
        selectCommonRecords.getAllMagazines($scope.userData.usersUniqueID, $scope.offsetVal, $scope.limitTill)
          .then(function (result) {
            $scope.dashboardMyData = [];
            $scope.dashboardAvailData = [];
            $scope.showLoad = 1;

            $scope.showProgressiveImage();

            for (var i = 0; i < result.length; i++) {

              if (result[i].isPurchased == "true") {
                if ($scope.dashboardMyData.indexOf(result[i]) == -1) {
                  $scope.dashboardMyData.push(result[i]);
                }
              } else {
                if ($scope.dashboardAvailData.indexOf(result[i]) == -1) {
                  $scope.dashboardAvailData.push(result[i]);
                }
              }

            }
            if ($scope.dashboardMyData.length > 0) {
              $scope.resultText = 1;
            }
            $rootScope.refreshCheckMagazine = 0;
            $scope.updateData = 0;
            $ionicLoading.hide();
          }, function (err) { });
        $scope.spinVal = 0;

      }

    }
    $scope.getMagazineDataList = function () {
      $scope.magazineList = [];

      selectRecords.getAssetsList()
        .then(function (result) {
          $scope.magazineList = result;
        });
    }




    $scope.displayData($scope.offsetVal);
    $scope.getMagazineDataList();

    $scope.getAllMagazineData();


    //======= FOR COMMON DATA END================

    $scope.loadMore = function () {
      $scope.offsetVal = localStorage.getItem("offsetVal");
      $scope.spinVal = 1;

      $scope.offsetVal = parseInt($scope.offsetVal) + 20;
      var offsetVal = localStorage.setItem("offsetVal", $scope.offsetVal);
      selectCommonRecords.getAllMagazines($scope.userData.usersUniqueID, $scope.offsetVal, $scope.limitTill)
        .then(function (result) {
          $scope.tempMyData = [];
          $scope.tempAvailData = [];


          for (var i = 0; i < result.length; i++) {
            if (result[i].isPurchased == "true") {
              $scope.tempMyData.push(result[i]);
              if ($scope.dashboardMyData.indexOf(result[i] == -1)) {
                $scope.dashboardMyData.push(result[i]);
              }
            } else {
              $scope.tempAvailData.push(result[i]);
              if ($scope.dashboardAvailData.indexOf(result[i] == -1)) {
                $scope.dashboardAvailData.push(result[i]);
              }
            }

          }
          $timeout(function () {
            $scope.spinVal = 0;
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }, 5000);

          $scope.showProgressiveImage();
        })


    }

    //-------------FOR PREVIEW FUNCTIONALITY STARTS-----------
    $scope.openURL = function (sku, val) {

      var inAppBrowserbRef = cordova.InAppBrowser.open(val, '_blank', 'location=no,footer=yes,closebuttoncaption=Done,closebuttoncolor=#0000ff');
      inAppBrowserbRef.addEventListener('exit', loadExitCallBack);

      function loadExitCallBack() {
        $scope.backView = $ionicHistory.backView();
        $state.go('tab.dash');
      }

      return false;
    }
    //-------------FOR AUTO-UPDATE FUNCTIONALITY STARTS------------

    $scope.autoUpdate = function () {
      for (var j = 0; j < $scope.updateAvailable.length; j++) {
        var index = $scope.dashboardMyData.findIndex(function (item, i) {
          return item.magazine_id === $scope.updateAvailable[j];
        });

        var oldDataIndex = $scope.tempArrayDwn.findIndex(function (item, i) {
          return item.asset_id === $scope.updateAvailable[j];
        });

        var data = $scope.dashboardMyData[index];
        var oldData = {
          asset_id: $scope.tempArrayDwn[oldDataIndex].asset_id,
          version: $scope.tempArrayDwn[oldDataIndex].version,
          coverPath: data.coverPath,
          downloadPath: data.downloadPath,
          sku: data.sku
        }
        $scope.download(data.sku, data.urlZipFile, data.magazine_id, data.version, data.urlImageThumb, '', '', data.title, true, oldData) // Set isUpdating to true for update
      }
    }

    //-------------FOR AUTO-UPDATE FUNCTIONALITY ENDS------------

    //-------------FOR PREVIEW FUNCTIONALITY ENDS-------------

    //-------------FOR MAGAZINE DOWNLOADS FUNCTIONALITY STARTS-----------
    $scope.download = function (id, srcUrl, asset_id, version, thumbnail, indexVal, forArray, title, isUpdating = false, oldData = {}) {
      $scope.downloadQueue = angular.fromJson(localStorage.getItem('downloadQueueMags'));
      $rootScope.downloadDataMags = angular.fromJson(localStorage.getItem('downloadDataMags'));

      let dataIndex = $scope.dashboardMyData.findIndex(function (item, i) {
        return item.asset_id == asset_id;
      });

      if (dataIndex != -1) {
        if ($scope.dashboardMyData[dataIndex].downloadStatus == 'true' || $scope.dashboardMyData[dataIndex].downloadStatus == true) {
          return;
        }
      }
      //create JSON of download data starts here
      var downloadData = {
        id: id,
        srcUrl: srcUrl,
        asset_id: asset_id,
        version: version,
        thumbnail: thumbnail,
        indexVal: indexVal,
        forArray: forArray,
        title: title,
        isUpdating: isUpdating,
        oldData: oldData
      };
      //create JSON of download data ends here

      var toastMsg = "Download started";
      var forArray = forArray;
      var id = id;
      var srcUrl = encodeURI(srcUrl);
      var asset_id = asset_id;
      var version = version;
      var thumbnail = thumbnail;
      var indexVal = indexVal;
      var usersUniqueID = $scope.userData.usersUniqueID;

      if (!isUpdating) {
        $scope.progressDiv = true;
        $scope.showProgress = true;
        localStorage.setItem('progressDivMags', $scope.progressDiv);

        if (($scope.downloadQueue.indexOf(asset_id) == -1) || ($scope.downloadQueue.indexOf(parseInt(asset_id)) == -1)) {
          $scope.downloadQueue.push(parseInt(asset_id));
          let index = $rootScope.downloadDataMags.findIndex(function (item, i) {
            return item.asset_id == asset_id;
          });
          if (index == -1) {
            $rootScope.downloadDataMags.push(downloadData);
          }
          $scope.downloadQueue = [... new Set($scope.downloadQueue)];
          localStorage.setItem('downloadQueueMags', angular.toJson($scope.downloadQueue));
          localStorage.setItem('downloadDataMags', angular.toJson($rootScope.downloadDataMags));
        }

        if ($scope.downloadQueue.length == 1) {
          downloadAsset.downloadMagazine(id, srcUrl, asset_id, version, thumbnail, indexVal, forArray, usersUniqueID, 'magazine', title, isUpdating, oldData);
        } else {
          toastMsg = "Added to queue";
        }

        $cordovaToast.show(toastMsg, "short", "bottom").then(function (success) {

        }, function (error) {

        });

      } else {
        var updateQueue = angular.fromJson(localStorage.getItem('updateQueueMags'));
        var updateData = angular.fromJson(localStorage.getItem('updateDataMags'));

        if (updateQueue.indexOf(asset_id) == -1) {
          updateQueue.push(parseInt(asset_id));
          updateData.push(downloadData);
          if (updateQueue.length == 1) {
            downloadAsset.downloadMagazine(id, srcUrl, asset_id, version, thumbnail, indexVal, forArray, usersUniqueID, 'magazine', title, isUpdating, oldData);
          }
        }

        localStorage.setItem('updateQueueMags', angular.toJson(updateQueue));
        localStorage.setItem('updateDataMags', angular.toJson(updateData));
      }
    }

    //-------------FOR MAGAZINE DOWNLOADS FUNCTIONALITY ENDS-----------


    //=====================Handling delete for downloads START ===============

    $scope.deleteAsset = function (sku, asset_id, version, indexVal, forArray) {
      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });
      var indexVal = indexVal;
      var asset_query = "DELETE FROM userAssets WHERE usersUniqueID =? AND asset_id = ? AND sku = ? AND subtype =?";
      $cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, asset_id, sku, 'magazine'])
        .then(function (res_query) {
          $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', 'magazine_' + sku).then(function (result) {
            $ionicLoading.hide();

            var alertPopup = $ionicPopup.alert({
              title: ' <i class="icon ion-checkmark placeholder-icon"></i>',
              template: 'Magazine removed from downloads.',
              buttons: [{
                text: '<b>OK</b>',
                type: 'button-green',
              }]
            });

            setTimeout(function () {
              alertPopup.close();
            }, 3000);

            alertPopup.then(function (res) {

              $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', 'magazine_cover_' + sku).then(function (res) {
                $ionicLoading.hide();

                if (forArray == 'dashboardMyData') {

                  // for (var i = 0; i < $scope.dashboardMyData.length; i++) {
                  //   if ($scope.dashboardMyData[i].magazine_id == asset_id) {
                  //     $scope.dashboardMyData[i].downloadStatus = "false";
                  //     $scope.dashboardMyData[i].downloadPath = '';
                  //     $scope.dashboardMyData[i].coverPath = '';
                  //   }


                  // }
                  // $scope.checkDownloads();
                  // $scope.getAllMagazineData();

                  $scope.updateRecords();

                } else if (forArray == 'topicResult') {
                  for (var i = 0; i < $scope.topicResult.length; i++) {
                    if ($scope.topicResult[i].magazine_id == asset_id) {
                      $scope.topicResult[i].downloadStatus = "false";
                      $scope.topicResult[i].downloadPath = '';
                      $scope.topicResult[i].coverPath = '';
                      $scope.updateData = 1;
                    }

                  }
                  $scope.checkDownloads();
                  if ($scope.offsetVal > 0) {
                    $scope.offsetVal = $scope.offsetVal - 20;
                    localStorage.setItem("offsetVal", $scope.offsetVal);
                  }
                  $scope.displayData($scope.offsetVal);
                  $scope.getAllMagazineData();
                } else if (forArray == 'allMagazines') {

                  for (var i = 0; i < $scope.allMagazines.length; i++) {
                    if ($scope.allMagazines[i].magazine_id == asset_id) {
                      $scope.allMagazines[i].downloadStatus = "false";
                      $scope.allMagazines[i].downloadPath = '';
                      $scope.allMagazines[i].coverPath = '';
                      $scope.updateData = 1;
                    }

                  }
                  $scope.checkDownloads();
                  $scope.displayData($scope.offsetVal);
                }

                $ionicHistory.clearCache($state.current.name).then(function () {
                  $ionicHistory.clearHistory();
                  $state.reload();
                });

              }, function (err) {
                $ionicLoading.hide();
                $scope.updateRecords();
              })
            });

          }, function (err) {
            $ionicLoading.hide();
            $scope.updateRecords();
          });

        }, function (error) {
          $ionicLoading.hide();
        });
      $scope.showProgressiveImage();
    }

    $scope.undoDelete = function (sku, asset_id, version, indexVal, forArray) {
      var sku = sku;
      var asset_id = asset_id;
      var version = version;
      var forArray = forArray;
      //----------------------- Insert into Userassets for downloads in database =============


      var confirmPopup = $ionicPopup.confirm({
        title: ' <i class="icon ion-alert placeholder-icon"></i>',
        template: 'Are you sure you want to delete?',
        scope: $scope,
        buttons: [{
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
          $scope.deleteAsset(sku, asset_id, version, indexVal, forArray);
        } else {
          return false;
        }
      })

      //----------------------- Updating Status of downloads in database ends=============
    }

    //=====================Handling delete for downloads ENDS ===============
    //================ Handling Filter and Sort STARTS================================

    $scope.checkit = function (value) {
      $scope.flag = true;
      for (var a in $scope.magazineList) {
        $scope.magazineList[a].checked = false;
      }

    }
    $scope.filterVal = [];
    $scope.updateChkValue = function (val, index) {
      $scope.magazineList[index].checked = val.checked;
      $scope.topics.value = false; // Radio button off

      $scope.filterVal[index] = val.checked;
      var temp = $scope.filterVal.indexOf(true);
      if (temp == -1) {
        $scope.flag = false;
      } else {
        $scope.flag = true;
      }
    }

    $scope.topics = [];
    $scope.topicResult = [];
    $scope.pageStatus = '';
    $scope.status = '';
    $scope.noResult = false;
    $scope.filterLimit = 20;
    $scope.filterLoader = 'true';

    $scope.filter_it = function (resValue) {

      $scope.filterLimit = 20;
      var netCon = checkNetConn.checkConn();
      $scope.conStatus = checkNetConn.getConn();
      if ($scope.conStatus == 'none') {
        $scope.allMagazines = $scope.dashboardMyData;
      }

      $scope.topicResult = [];
      $scope.noResult = false;
      $scope.filterOn = true;

      if (resValue == true) {
        $scope.resvalue = "true";
        $scope.status = "My";
      } else if (resValue == false) {
        $scope.resvalue = "false";
        $scope.status = "Available";
      } else {
        $scope.resvalue = "all";
        $scope.status = "All";
      }

      if ($scope.topics.value == 'all modeling' || $scope.topics.value == 'all railroading') {
        $scope.tempVal = [];
        $scope.tempRadio = $scope.topics.value;
        var selectedVal = $scope.topics.value;
        var result = selectedVal.slice(4, selectedVal.length);

        // When connection is not available show no records for not purchased magazines
        if ($scope.conStatus == "none" && $scope.status == "Available") {
          $scope.topicResult = [];
          $scope.noResult = true;
          $scope.searchStatus = 1;
          $scope.pageStatus = $scope.status + ' ' + result + ' Issues';
          $scope.closeWithoutRemove();
          $scope.filterOn = true;
          return;
        }

        if (result == 'railroading') {
          for (var j = 0; j < $scope.allMagazines.length; j++) {
            var str = $scope.allMagazines[j].metadata;
            var res = str.match(/Railroading/);

            if (($scope.allMagazines[j].isPurchased == $scope.resvalue) && (res)) {
              $scope.topicResult.push($scope.allMagazines[j]);
            } else if (($scope.resvalue == "all") && (res)) {
              $scope.topicResult.push($scope.allMagazines[j]);
            }
          }
        } else {
          for (var i = 0; i < $scope.allMagazines.length; i++) {
            var str = $scope.allMagazines[i].metadata;
            var res = str.match(/Modeling/);

            if (($scope.allMagazines[i].isPurchased == $scope.resvalue) && res) {
              $scope.topicResult.push($scope.allMagazines[i]);
            } else if (($scope.resvalue == "all") && (res)) {
              $scope.topicResult.push($scope.allMagazines[i]);
            }
          }
        }
        $scope.searchStatus = 1;
        $scope.pageStatus = $scope.status + ' ' + result + ' Issues';
        $scope.closeWithoutRemove();
        $scope.filterOn = true;
      } else {
        $scope.tempRadio = [];


        $scope.tempVal = [];

        for (var i = 0; i < $scope.magazineList.length; i++) {
          if ($scope.magazineList[i].checked) {
            $scope.tempVal[i] = true;
          } else {
            $scope.tempVal[i] = false;
          }

        }
        for (var i = 0; i < $scope.magazineList.length; i++) {
          if ($scope.magazineList[i].checked == true) {
            var skuVal = $scope.magazineList[i].sku;
            for (var j = 0; j < $scope.allMagazines.length; j++) {
              var strn = $scope.allMagazines[j].sku;
              var res = strn.slice(0, 4);
              if (($scope.allMagazines[j].isPurchased == $scope.resvalue) && (res == skuVal)) {
                $scope.topicResult.push($scope.allMagazines[j]);
              } else if (($scope.resvalue == "all") && (res == skuVal)) {
                $scope.topicResult.push($scope.allMagazines[j]);
              }

            }

          }
        }

        $scope.searchStatus = 1;
        $scope.pageStatus = $scope.status + ' Issues';
        $scope.closeWithoutRemove();
        $scope.filterOn = true;

      }
      if ($scope.topicResult.length == 0) {
        $scope.noResult = true;
      }
      //Set scroll to top
      $scope.scrolltoTop();

      $scope.showProgressiveImage();
    }
    $scope.loadMoreFilter = function (val) {
      $scope.spinVal = 1;

      if ($scope.conStatus != "none") {
        if (val < $scope.topicResult.length && $scope.topicResult.length != 0) {
          $scope.filterLimit = $scope.filterLimit + 10;
          $scope.spinVal = 0;
          $scope.filterLoader = 'true';
        } else if ($scope.topicResult.length == 0 && val < $scope.total_records_magazines) {
          $scope.filterLimit = $scope.filterLimit + 10;
          $scope.filterLoader = 'true';
          $scope.spinVal = 0;
        } else {
          $scope.spinVal = 0;
          $scope.filterLoader = 'false';
        }

      } else if ($scope.conStatus == "none") {
        if (val < $scope.magDownloads) {
          $scope.filterLimit = $scope.filterLimit + 10;
          $scope.spinVal = 0;
          $scope.filterLoader = 'true';
        } else {
          $scope.spinVal = 0;
          $scope.filterLoader = 'false';
        }

      }
      $timeout(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, 5000);

      $scope.showProgressiveImage();
    }



    $scope.backDashboard = function () {
      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });

      var netCon = checkNetConn.checkConn();
      $scope.conStatus = checkNetConn.getConn();

      $scope.filterLimit = 10;
      $scope.filterOn = false;
      $scope.sortOn = false;
      $scope.noResult = false;
      $scope.searchStatus = 0;
      $scope.flag = false;
      $scope.topicResult = [];
      $scope.order = null;
      $scope.filterVal = [];
      $scope.topics.value = false;
      $scope.tempVal = [];
      $scope.tempRadio = [];
      for (var a in $scope.magazineList) {
        $scope.magazineList[a].checked = false;
      }

      $ionicLoading.hide();

      $scope.showProgressiveImage();
    }
    //============== FOR FILTER ENDS==========================

    //=============== FOR SORT STARTS=========================

    $scope.sortIt = function (value) {
      var netCon = checkNetConn.checkConn();
      $scope.conStatus = checkNetConn.getConn();

      $scope.sortOn = true;
      if ($scope.topicResult.length == 0 && $scope.noResult == true) {
        $scope.noResult = true;
        $scope.closeWithoutRemove2();
        $scope.sortOn = true;
        return;
      } else if ($scope.topicResult.length > 0) {
        if (value == 'DESC') {
          $scope.order = '-sku';
        } else {
          $scope.order = 'sku';
        }
        $scope.searchStatus = 1;
      } else if ($scope.topicResult.length == 0 && $scope.noResult == false) {
        if ($scope.conStatus == 'none') {
          $scope.allMagazines = $scope.dashboardMyData;
          $scope.filterLimit = $scope.dashboardMyData.length;
        }
        if (value == 'DESC') {
          $scope.order = '-sku';
          $scope.pageStatus = "Descending";
        } else {
          $scope.order = 'sku';
          $scope.pageStatus = "Ascending";
        }
        $scope.searchStatus = 2;
      } else {


      }

      //Set scroll to top
      $scope.scrolltoTop();

      $scope.flag = true;
      $scope.closeWithoutRemove2();
      $scope.sortOn = true;

      $scope.showProgressiveImage();
    }

    //=============== FOR SORT ENDS=========================

    //=============== HAndling Filter and Sort ENDS=========================


    // ======= FOR MODAL VIEW =======

    var init = function () {
      if ($scope.modal) {
        return $q.when();
      } else {
        return $ionicModal.fromTemplateUrl('modal.html', {
          scope: $scope,
          animation: 'slide-in-up',
          backdropClickToClose: true
        })
          .then(function (modal) {
            $scope.modal = modal;
          })
      }
    };

    $scope.open = function () {
      init().then(function () {
        $scope.modal.show();
        $scope.flag = false;


        // ----------FOR DISABLING THE FILTER OPTION ON CLOSE START
        if ($scope.filterOn == false) {

          $scope.topics = [];
          for (var i = 0; i < $scope.magazineList.length; i++) {
            $scope.magazineList[i].checked = false;

          }
        }

        // ----------FOR DISABLING THE FILTER OPTION ON CLOSE END
        if ($scope.tempVal) {
          for (var i = 0; i < $scope.magazineList.length; i++) {
            $scope.magazineList[i].checked = $scope.tempVal[i];
            $scope.filterVal[i] = $scope.tempVal[i];
          }

        }

        if ($scope.tempRadio) {
          $scope.topics.value = $scope.tempRadio;
        }

        //------Check For FILTER OPTIONS FILLED START
        if ($scope.filterOn == true) {
          $scope.flag = true;
        }
        //------Check For FILTER OPTIONS FILLED ENDS
      });
    };

    $scope.closeWithoutRemove = function () {
      if ($scope.searchStatus == 1) {
        $scope.filterOn = true;
      } else {
        $scope.filterOn = false;
      }
      if ($scope.noResult == true) {
        $scope.noResult = true;
      } else {
        $scope.noResult = false;
      }


      $scope.modal.hide();
      if ($scope.timeToLoadImages()) {
        $scope.showProgressiveImage();
      }
    };

    var init2 = function () {
      if ($scope.modal2) {
        return $q.when();
      } else {
        return $ionicModal.fromTemplateUrl('modal2.html', {
          scope: $scope,
          animation: 'slide-in-up',
          backdropClickToClose: true
        })
          .then(function (modal) {
            $scope.modal2 = modal;
          })
      }
    };

    $scope.open2 = function () {
      init2().then(function () {
        $scope.modal2.show();
      });
    };
    $scope.closeWithoutRemove2 = function () {
      if ($scope.searchStatus == 2) {
        $scope.sortOn = true;
      } else if ($scope.sortOn == true && $scope.order) {
        $scope.sortOn == true;
      } else {
        $scope.sortOn = false;
      }
      $scope.modal2.hide();

      if ($scope.timeToLoadImages()) {
        $scope.showProgressiveImage();
      }
    };

    $scope.showProgressiveImage = function () {
      // For progressive image feature
      setTimeout(function () {
        $('.section-image').each(function () {

          var image = new Image();
          var previewImage = $(this).find('.loadingImage');
          var newImage = $(this).find('.overlay');
          ImgCache.isCached(previewImage.data('image'), function (path, success) {
            if (success) {
              previewImage.addClass('d-none');
            } else {
              if (!newImage.hasClass('imgLoaded'))
                newImage.addClass('d-none');
            }
          });

          image.onload = function () {
            newImage.removeClass('d-none');
            newImage.addClass('imgLoaded');
          };

          image.src = previewImage.data('image');

        })
      }, 100);
      // For progressive image feature
    }

    $scope.scrolltoTop = function () {
      $ionicScrollDelegate.scrollTop();
    }

    // For refreshing data starts here
    $scope.refreshData = function () {
      if ($scope.conStatus == 'none') {
        $cordovaToast.show("Please connect to internet to refresh", "short", "bottom").then(function (success) { });
        $scope.$broadcast('scroll.refreshComplete');
        return;
      } else if ($scope.showProgress == true || $scope.showProgress == 'true') {
        $cordovaToast.show("Can not refresh now, downloading is in progress.", "short", "bottom").then(function (success) { });
        $scope.$broadcast('scroll.refreshComplete');
        return;
      }
      //Get previous magazines list to check the filters applied.
      var previousCheckedMags = $scope.magazineList;

      localStorage.setItem('magazinesRefreshed', angular.toJson(false));
      //Show loading
      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });
      // On refresh delete records first
      deleteRecords.delAssets($scope.userData.usersUniqueID).then(function (res) {
        deleteRecords.delAssetsList($scope.userData.usersUniqueID).then(function (result) {
          //Fetch data from API
          manageRecords.setAssets($scope.userData.usersUniqueID).then(function (res) {
            $scope.total_records_magazines = res;
            localStorage.setItem('total_records_magazines', $scope.total_records_magazines);
            manageRecords.setAssetsList($scope.userData.usersUniqueID).then(function (res) {
              $scope.magazineList = [];
              // Store new data.
              selectRecords.getAssetsList().then(function (result) {
                $scope.magazineList = result;

                var limit = $scope.offsetVal + 20;

                $ionicHistory.clearCache($state.current.name).then(function () {
                  $ionicHistory.clearHistory();
                });

                selectCommonRecords.getAllMagazines($scope.userData.usersUniqueID, 0, limit).then(function (result) {
                  $scope.dashboardMyData = [];
                  $scope.dashboardAvailData = [];
                  $scope.showLoad = 1;

                  for (var i = 0; i < result.length; i++) {
                    if (result[i].isPurchased == "true") {
                      $scope.dashboardMyData.push(result[i]);
                    } else {
                      $scope.dashboardAvailData.push(result[i]);
                    }

                  }

                  if ($scope.dashboardMyData.length > 0) {
                    $scope.resultText = 1;
                  }
                  // Handling data refreshing when sort is applied
                  $scope.getAllMagazineData();

                  // Handling data refreshing when filter is applied
                  if ($scope.searchStatus == 1) {
                    // Add checked property to new magazine list
                    $scope.checkit();
                    // Copy checked filters to new list
                    for (var i = 0; i < $scope.magazineList.length; i++) {
                      if (previousCheckedMags[i].sku == $scope.magazineList[i].sku) {
                        $scope.magazineList[i].checked = previousCheckedMags[i].checked;
                      }
                    }
                    selectCommonRecords.getAllMagazines($scope.userData.usersUniqueID, 0, $scope.total_records_magazines).then(function (result) {
                      $scope.allMagazines = result;

                      if ($scope.resvalue == "true") {
                        $scope.filter_it(true);
                      } else if ($scope.resvalue == "false") {
                        $scope.filter_it(false);
                      } else {
                        $scope.filter_it('all');
                      }

                    });
                  }
                  $scope.$broadcast('scroll.refreshComplete');
                  // Set refresh status in local storage
                  localStorage.setItem('magazinesRefreshed', angular.toJson(true));
                  // Show Toast message
                  $cordovaToast.show("Data refreshed", "short", "bottom").then(function (success) { });

                  $scope.showProgressiveImage();
                  $ionicLoading.hide();
                });
              });
            }, function (error) {
              $ionicLoading.hide();
            })
          });
        });
      });
    }
    // For refreshing data ends here

    var refreshStatus = angular.fromJson(localStorage.getItem('magazinesRefreshed'));
    if (refreshStatus != null && !refreshStatus) {
      $scope.refreshData();
    }

    $scope.jumpToAvailable = function () {
      
      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });

      selectCommonRecords.getMyIssuesCount($scope.userData.usersUniqueID).then((myIssuesCount) => {
        $scope.offsetVal = localStorage.getItem("offsetVal");
        $scope.spinVal = 1;

        $scope.offsetVal = parseInt($scope.offsetVal) + myIssuesCount + 20;
        localStorage.setItem("offsetVal", $scope.offsetVal);
        selectCommonRecords.getAllMagazines($scope.userData.usersUniqueID, 0, $scope.offsetVal)
          .then(function (result) {
            $scope.tempMyData = [];
            $scope.tempAvailData = [];

            $scope.dashboardMyData = [];
            $scope.dashboardAvailData = [];

            for (var i = 0; i < result.length; i++) {
              if (result[i].isPurchased == "true") {
                $scope.tempMyData.push(result[i]);
                if ($scope.dashboardMyData.indexOf(result[i] == -1)) {
                  $scope.dashboardMyData.push(result[i]);
                }
              } else {
                $scope.tempAvailData.push(result[i]);
                if ($scope.dashboardAvailData.indexOf(result[i] == -1)) {
                  $scope.dashboardAvailData.push(result[i]);
                }
              }
            }

            $timeout(function () {
              $ionicLoading.hide();
              var offsetTop = document.getElementById("testHeadingAvail").getBoundingClientRect().top;
							$ionicScrollDelegate.scrollBy(0, offsetTop - 100);
            }, 1000);

            $scope.showProgressiveImage();
          }, function(error){
            $ionicLoading.hide();
          });
      }, function(error){
        $ionicLoading.hide();
      });
    }

    $scope.jumpToMyIssues = function(){
      var offsetTop = document.getElementById("testHeading").getBoundingClientRect().top;
      $ionicScrollDelegate.scrollBy(0, offsetTop - 100);
    }

    angular.element(document.querySelector('.myDiv')).bind('scroll', function () {
      if ($('#testHeading').offset()) {
        var divHt = $('#testHeading').offset().top;

        var statusText = '';

        if (divHt < 105 || divHt == 105) {
          // document.getElementById("pageHeading").innerHTML = "My Issues";
          statusText = "My Issues";
        } else {
          statusText = "My Downloads";
          // document.getElementById("pageHeading").innerHTML = "My Downloads";
        }

        var template = `<div class="float-l">${statusText}</div><div class="move_available_container">
          <button id="move_btn" ng-click="jumpToAvailable()">
						<span>
							<img src="img/header-back.jpg" id="move_down_arrow"/>
						</span>
            <span>Available Issues</span>
          </button>
        </div>`;
        angular.element(document.getElementById("pageHeading")).html($compile(template)($scope));
      }else if($scope.conStatus == 'none'){
        document.getElementById("pageHeading").innerHTML = "My Downloads";
      }

      if ($('#testHeading').offset() && $('#testHeadingAvail').offset()) {
        var statusText = '';

        var divHtAvail = $('#testHeadingAvail').offset().top;
        if (divHtAvail < 105 || divHt == 105) {
          // document.getElementById("pageHeading").innerHTML = "Available Issues";
          var template = `<div class="float-l">Available Issues</div><div class="move_available_container">
            <button id="move_btn" ng-click="jumpToMyIssues()">
              <span>
                <img src="img/header-back.jpg" id="move_down_arrow" style="transform: rotate(90deg)"/>
              </span>
              <span>My Issues</span>
            </button>
          </div>`;
          angular.element(document.getElementById("pageHeading")).html($compile(template)($scope));
        } else {
          if (divHt < 105 || divHt == 105) {
            // document.getElementById("pageHeading").innerHTML = "My Issues";
            statusText = "My Issues";
          } else {
            // document.getElementById("pageHeading").innerHTML = "My Downloads";
            statusText = "My Downloads";
          }
          
          var template = `<div class="float-l">${statusText}</div><div class="move_available_container">
            <button id="move_btn" ng-click="jumpToAvailable()">
              <span>
                <img src="img/header-back.jpg" id="move_down_arrow"/>
              </span>
              <span>Available Issues</span>
            </button>
          </div>`;
          angular.element(document.getElementById("pageHeading")).html($compile(template)($scope));
        }
      }
    });

    $scope.updateRecords = function () {
      $scope.offsetVal = parseInt(localStorage.getItem("offsetVal"));

      var offsetVal = 0;
      var limitTill = $scope.offsetVal + $scope.limitTill;

      $scope.checkDownloads();

      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });

      selectCommonRecords.getAllMagazines($scope.userData.usersUniqueID, offsetVal, limitTill)
        .then(function (result) {

          $scope.dashboardMyData = [];
          $scope.dashboardAvailData = [];
          for (var i = 0; i < result.length; i++) {
            if (result[i].isPurchased == "true") {
              $scope.dashboardMyData.push(result[i]);
            } else {
              $scope.dashboardAvailData.push(result[i]);
            }
          }

          if ($scope.dashboardMyData.length > 0) {
            $scope.resultText = 1;
          }
          $ionicLoading.hide();

        }, function (err) {
          $ionicLoading.hide();
        });
    }
  })
})