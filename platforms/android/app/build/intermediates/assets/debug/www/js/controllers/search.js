// 
//   Developer : Nitisha Sharma
//   Skype Id  : nsharma111
//   File Name : search.js
//   Purpose   : For global search
//  
/*-------------------- MY PROFILE CONTROLLER STARTS*---------------- */


app.controller('SearchCtrl', function ($scope, $location, $ionicHistory, userService, CONSTANTS, $ionicLoading, $base64, serverAPICall, $cordovaDialogs, $cordovaSQLite, checkNetConn, $state, $cordovaFile, $cordovaFileTransfer, setUpdateTime, $interval, $ionicPopup, $timeout, $rootScope, checkRecords, manageRecords, selectCommonRecordsBook, downloadAsset, $cordovaToast) {

  ionic.Platform.ready(function () {
    $scope.conStatus = '';
    $scope.haveBooks = '';
    $scope.haveofflineBooks = '';
    $scope.downloadCount = 0;
    $scope.updateAvailableMags = [];
    $scope.updateAvailableBooks = [];
    $scope.progressDivMags = false;
    $scope.progressDivBooks = false;
    $scope.progressDiv = false;
    $scope.downloadQueueMags = angular.fromJson(localStorage.getItem('downloadQueueMags'));
    $scope.downloadQueueBooks = angular.fromJson(localStorage.getItem('downloadQueueBooks'));
    $rootScope.downloadDataMags = angular.fromJson(localStorage.getItem('downloadDataMags'));
    $rootScope.downloadDataBooks = angular.fromJson(localStorage.getItem('downloadDataBooks'));

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
        alertPopup.then(function (res) {

        });
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
        alertPopup.then(function (res) {

        });
        $rootScope.errorDownloadingBook = false;
      }
    });

    $scope.$on('$ionicView.enter', function () {

      $scope.progressDivMags = angular.fromJson(localStorage.getItem('progressDivMags'));
      $scope.progressDivBooks = angular.fromJson(localStorage.getItem('progressDivBooks'));
      $scope.updateAvailableMags = angular.fromJson(localStorage.getItem('updateAvailableMags'));
      $scope.updateAvailableBooks = angular.fromJson(localStorage.getItem('updateAvailableBooks'));

      $scope.downloadQueueMags = angular.fromJson(localStorage.getItem('downloadQueueMags'));
      $scope.downloadQueueBooks = angular.fromJson(localStorage.getItem('downloadQueueBooks'));

      var downloadStatus = localStorage.setItem("downloadCount", 0);
      $scope.showProgress = localStorage.getItem("showProgress");


      if ($scope.progressDivMags || $scope.progressDivBooks) {
        $scope.progressDiv = true;
      } else {
        $scope.progressDiv = false;
      }

      if (($rootScope.no_of_book_updated == 1) || ($rootScope.no_of_magazine_updated == 1)) {
        $scope.progressDiv = false;
      }

      $scope.checkDownloaded = function () {

        $scope.userAssetData = [];
        var demoQuery = "SELECT asset_id,subtype,sku,version FROM userAssets";
        $cordovaSQLite.execute(dbCon, demoQuery, []).then(function (Demores) {
          if (Demores.rows.length > 0) {
            for (var i = 0; i < Demores.rows.length; i++) {
              $scope.userAssetData.push(Demores.rows.item(i));
            }
            $scope.downloadCount = Demores.rows.length;

            $scope.oldDownloadCount = localStorage.getItem("downloadCount");

            if ($scope.downloadCount > $scope.oldDownloadCount || $scope.downloadCount < $scope.oldDownloadCount) {
              localStorage.setItem("downloadCount", $scope.downloadCount);
              $scope.conStatus = checkNetConn.getConn();

              if ($scope.conStatus == 'none') {
                $scope.fetchData('nowifi');
              } else {
                $scope.selectSearchData();
              }

            }

          }

        }, function (err) { });

        $scope.showProgressiveImage();
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
        dbCon = $cordovaSQLite.openDB({
          name: "wrp.db",
          location: "default"
        });
      }

      $scope.$watch(function () {
        checkNetConn.checkConn();
        return checkNetConn.getConn();
      }, function (value) {
        if (value == 'none') {
          $scope.fetchData('nowifi');
          $scope.conStatus = value;
          $scope.progressDiv = false;
          $scope.showProgress = false;
          $scope.progressDivMags = false;
          $scope.progressDivBooks = false;
        } else {
          $scope.total_records_magazines = localStorage.getItem("total_records_magazines");

          $scope.fetchData('wifi');
          $scope.conStatus = value;

          $scope.downloadQueueMags = angular.fromJson(localStorage.getItem('downloadQueueMags'));
          $scope.downloadQueueBooks = angular.fromJson(localStorage.getItem('downloadQueueBooks'));

          $scope.showProgressiveImage();
        }
      });
      $("#search").focus();
    });
    $scope.spinVal = 0;
    $scope.filterLoader = 'true';
    $scope.searchLimit = 5;
    $scope.progressDiv = false;


    $scope.loadMoreFilter = function (val) {
      $scope.spinVal = 1;
      $scope.searchLimit = $scope.searchLimit + 5;
      $timeout(function () {
        $scope.spinVal = 0;
        $scope.filterLoader = 'true';
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }, 5000);

      $scope.showProgressiveImage();

    }
    $scope.searchedList = [];
    $scope.back = function () {
      $scope.backView = $ionicHistory.backView();
      $ionicHistory.goBack();
    };
    $scope.tempString = '';
    $scope.searchData = [];
    $scope.searchResult = [];
    //------------- EMPTY SEARCH INPUT BOX----------------

    $scope.checkLen = function (val) {
      if (val > 1) {
        $scope.tempString = $scope.searchData.searchString;
        $scope.showProgressiveImage();
      }
      return false;
    }


    $scope.clearSearch = function () {
      var netCon = checkNetConn.checkConn();
      $scope.conStatus = checkNetConn.getConn();
      $scope.searchLimit = 5;
      $scope.searchData.searchString = '';
    }
    $scope.showLoader = function (val) {
      if (val == 0 || val == 1) {
        $scope.showLoaderVal = true;
        $timeout(function () {
          $scope.showLoaderVal = false;
        }, 2000);
      }
    }

    $scope.searchList = [];
    $scope.searchListBook = [];
    $scope.searchListMagazine = [];
    $scope.fetchData = function (val) {

      if (val == 'nowifi') {

        $scope.resultLen = '';

        var search_query = "SELECT m.magazine_id, m.title, m.isPurchased, m.metadata, m.latestUp, m.sku, m.urlImageThumbSmall, m.urlImageThumb, m.price, m.urlToContent, m.shopifyURL, m.year, m.version, m.urlZipFile, a.asset_id, a.usersUniqueID, a.coverPath,'magazine' as subtype, a.downloadStatus AS 'downloadStatus', a.downloadPath AS 'downloadPath' FROM magazines m, userAssets a WHERE m.magazine_id = a.asset_id AND a.downloadStatus = 'true' AND a.subtype = 'magazine'";


        $cordovaSQLite.execute(dbCon, search_query, []).then(function (Queryres) {
          if (Queryres.rows.length > 0) {
            $scope.searchListMagazine = [];
            for (var i = 0; i < Queryres.rows.length; i++) {
              $scope.searchListMagazine.push(Queryres.rows.item(i));
            }
          } else {
            $scope.searchListMagazine = [];
          }
          $scope.resultLen = Queryres.rows.length;

        });

        checkRecords.checkBookData()
          .then(function (result) {
            $scope.haveofflineBooks = result;
            if ($scope.haveofflineBooks == 'false') {
              manageRecords.setAssetsBooks($scope.userData.usersUniqueID)
                .then(function (result) {
                  $scope.total_records_books = localStorage.getItem("total_records_books");
                  $scope.getOfflineBookData();
                });
            } else {
              $scope.getOfflineBookData();
            }

          });


        $scope.getOfflineBookData = function () {
          var search_book_query = "SELECT b.book_id, b.title, b.isPurchased, b.metadata, b.latestUp, b.sku, b.urlImageThumbSmall, b.urlImageThumb, b.price, b.urlToContent, b.shopifyURL, b.year, b.version, b.urlZipFile, a.asset_id, a.usersUniqueID, a.coverPath,'book' AS subtype, a.downloadStatus AS 'downloadStatus', a.downloadPath AS 'downloadPath' FROM books b, userAssets a WHERE b.book_id = a.asset_id AND a.downloadStatus = 'true' AND a.subtype = 'book'";
          $cordovaSQLite.execute(dbCon, search_book_query, []).then(function (BookQueryres) {
            if (BookQueryres.rows.length > 0) {
              $scope.searchListBook = [];
              for (var i = 0; i < BookQueryres.rows.length; i++) {
                $scope.searchListBook.push(BookQueryres.rows.item(i));
              }
            } else {
              $scope.searchListBook = [];
            }
            $scope.searchList = [];
            $scope.resultLen = parseInt($scope.searchListBook.length) + parseInt($scope.searchListMagazine.length);
            $scope.searchList = $scope.searchListMagazine.concat($scope.searchListBook);

          });

        }



      } else {
        if ($scope.searchList.length == 0 || $scope.searchList.length < $scope.total_records_magazines) {
          $scope.selectSearchData = function () {
            var search_query = "SELECT m.magazine_id, m.title, m.isPurchased, m.metadata, m.latestUp, m.sku, m.urlImageThumbSmall, m.urlImageThumb, m.price, m.urlToContent, m.shopifyURL, m.year, m.version, m.urlZipFile, a.asset_id, a.usersUniqueID, a.coverPath, 'magazine' as subtype, CASE WHEN a.asset_id = m.magazine_id THEN a.downloadStatus ELSE m.downloadStatus END AS 'downloadStatus', CASE WHEN a.asset_id = m.magazine_id THEN a.downloadPath ELSE m.downloadPath END AS 'downloadPath' FROM magazines m LEFT JOIN userAssets a on m.magazine_id = a.asset_id";
            $cordovaSQLite.execute(dbCon, search_query, []).then(function (Queryres) {

              if (Queryres.rows.length > 0) {
                $scope.searchListMagazine = [];
                for (var i = 0; i < Queryres.rows.length; i++) {
                  $scope.searchListMagazine.push(Queryres.rows.item(i));
                }
              } else {
                $scope.searchListMagazine = [];
              }

            });
            //===================== CHECK FOR BOOK DATA IN DATABASE


            checkRecords.checkBookData()
              .then(function (result) {
                $scope.haveBooks = result;
                if ($scope.haveBooks == 'false') {
                  manageRecords.setAssetsBooks($scope.userData.usersUniqueID)
                    .then(function (result) {
                      $scope.total_records_books = localStorage.getItem("total_records_books");
                      $scope.getBookData();
                    });
                } else {
                  $scope.getBookData();
                }

              });


            $scope.getBookData = function () {
              var search_book_query = "SELECT b.book_id, b.title, b.isPurchased, b.metadata, b.latestUp, b.sku, b.urlImageThumbSmall, b.urlImageThumb, b.price, b.urlToContent, b.shopifyURL, b.year, b.version, b.urlZipFile, a.asset_id, a.usersUniqueID, a.coverPath,'book' AS subtype, CASE WHEN a.asset_id = b.book_id THEN a.downloadStatus ELSE b.downloadStatus END AS 'downloadStatus', CASE WHEN a.asset_id = b.book_id THEN a.downloadPath ELSE b.downloadPath END AS 'downloadPath' FROM books b LEFT JOIN userAssets a on b.book_id = a.asset_id ";
              $cordovaSQLite.execute(dbCon, search_book_query, []).then(function (BookQueryres) {
                if (BookQueryres.rows.length > 0) {
                  $scope.searchListBook = [];
                  for (var i = 0; i < BookQueryres.rows.length; i++) {
                    $scope.searchListBook.push(BookQueryres.rows.item(i));
                  }

                } else {
                  $scope.searchListBook = [];
                }
                $scope.searchList = [];
                $scope.resultLen = parseInt($scope.searchListBook.length) + parseInt($scope.searchListMagazine.length);
                $scope.searchList = $scope.searchListMagazine.concat($scope.searchListBook);
              });
            }

          }
          $scope.selectSearchData();
        }
      }
    }


    //-------------FOR PREVIEW FUNCTIONALITY STARTS-----------
    $scope.openURL = function (sku, val) {

      var inAppBrowserbRef = cordova.InAppBrowser.open(val, '_blank', 'location=no,footer=yes,closebuttoncaption=Done,closebuttoncolor=#0000ff');
      inAppBrowserbRef.addEventListener('exit', loadExitCallBack);

      function loadExitCallBack(event) {
        $state.go('search');
      }
      return false;

    }

    //-------------FOR PREVIEW FUNCTIONALITY ENDS-----------

    //-------------FOR DOWNLOADS FUNCTIONALITY STARTS-----------

    $scope.download = function (id, srcUrl, asset_id, version, thumbnail, indexVal, subtype, title) {
      $scope.downloadQueueMags = angular.fromJson(localStorage.getItem('downloadQueueMags'));
      $scope.downloadQueueBooks = angular.fromJson(localStorage.getItem('downloadQueueBooks'));
      $rootScope.downloadDataMags = angular.fromJson(localStorage.getItem('downloadDataMags'));
      $rootScope.downloadDataBooks = angular.fromJson(localStorage.getItem('downloadDataBooks'));

      //create JSON of download data starts here
      var downloadData = {
        id: id,
        srcUrl: srcUrl,
        asset_id: asset_id,
        version: version,
        thumbnail: thumbnail,
        indexVal: indexVal,
        forArray: '',
        title: title
      };
      //create JSON of download data ends here

      var toastMsg = "Download started";

      var id = id;
      var srcUrl = srcUrl;
      var asset_id = asset_id;
      var version = version;
      var thumbnail = thumbnail;
      var indexVal = indexVal;
      var forArray = '';
      var usersUniqueID = $scope.userData.usersUniqueID;
      var subtype = subtype;

      $scope.progressDiv = true;

      if (subtype == 'magazine') {
        localStorage.setItem('progressDivMags', $scope.progressDiv);

        $scope.downloadQueueMags.push(parseInt(asset_id));
        $rootScope.downloadDataMags.push(downloadData);
        $scope.downloadQueueMags = [... new Set($scope.downloadQueueMags)];
        $rootScope.downloadDataMags = [... new Set($rootScope.downloadDataMags)];
        localStorage.setItem('downloadQueueMags', angular.toJson($scope.downloadQueueMags));
        localStorage.setItem('downloadDataMags', angular.toJson($rootScope.downloadDataMags));
      } else {
        localStorage.setItem('progressDivBooks', $scope.progressDiv);

        $scope.downloadQueueBooks.push(parseInt(asset_id));
        $rootScope.downloadDataBooks.push(downloadData);
        $scope.downloadQueueBooks = [... new Set($scope.downloadQueueBooks)];
        $rootScope.downloadDataBooks = [... new Set($rootScope.downloadDataBooks)];
        localStorage.setItem('downloadQueueBooks', angular.toJson($scope.downloadQueueBooks));
        localStorage.setItem('downloadDataBooks', angular.toJson($rootScope.downloadDataBooks));
      }

      $scope.progressDivMags = angular.fromJson(localStorage.getItem('progressDivMags'));
      $scope.progressDivBooks = angular.fromJson(localStorage.getItem('progressDivBooks'));

      if ($scope.downloadQueueMags.length == 1) {
        toastMsg = "Download started";
        downloadAsset.downloadMagazine(id, srcUrl, asset_id, version, thumbnail, indexVal, forArray, usersUniqueID, subtype, title);
      } else if ($scope.downloadQueueMags.length > 1) {
        toastMsg = "Added to queue";
      }

      if ($scope.downloadQueueBooks.length == 1) {
        toastMsg = "Download started";
        downloadAsset.downloadMagazine(id, srcUrl, asset_id, version, thumbnail, indexVal, forArray, usersUniqueID, subtype, title);
      } else if ($scope.downloadQueueBooks.length > 1) {
        toastMsg = "Added to queue";
      }

      $cordovaToast.show(toastMsg, "short", "bottom").then(function (success) {

      }, function (error) {

      });
    }


    //-------------FOR DOWNLOADS FUNCTIONALITY ENDS-----------

    $scope.deleteAsset = function (sku, asset_id, version, indexVal, subtype) {
      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });

      var asset_query = "DELETE FROM userAssets WHERE usersUniqueID =? AND asset_id = ? AND sku = ? AND version =? AND subtype =?";
      $cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, asset_id, sku, version, subtype])
        .then(function (res) {
          $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_' + sku).then(function (result) {
            if (subtype == 'magazine') {
              var assetName = 'Magazine';
            } else {
              var assetName = 'Book';
            }
            var alertPopup = $ionicPopup.alert({
              title: ' <i class="icon ion-checkmark placeholder-icon"></i>',
              template: assetName + ' removed from downloads.',
              buttons: [{
                text: '<b>OK</b>',
                type: 'button-green',
              }]
            });

            alertPopup.then(function (res) {

              if (subtype == 'magazine') {
                $rootScope.refreshCheckMagazine = 2;
              } else {
                $rootScope.refreshCheckBook = 2;
              }
              if ($scope.conStatus == 'none') {
                $scope.fetchData('nowifi');
              } else {
                $scope.selectSearchData();
              }


            });

            $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) {

            }, function (err) { })

            $ionicLoading.hide();

            $scope.selectSearchData();
          }, function (err) {

          });

      }, function (error) {
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
          title: ' <i class="icon ion-alert placeholder-icon"></i>',
          template: 'Problem in deleting magazine from downloads, try after sometime.',
          buttons: [{
            text: '<b>OK</b>',
            type: 'button-green',
          }]
        });

        alertPopup.then(function (res) {


        });
      });
      $scope.showProgressiveImage();
    }

    $scope.undoDelete = function (sku, asset_id, version, indexVal, subtype) {


      var sku = sku;
      var asset_id = asset_id;
      var version = version;
      var subtype = subtype;
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
          $scope.deleteAsset(sku, asset_id, version, indexVal, subtype);
        } else {

        }
      })
      //----------------------- Updating Status of downloads in database ends=============

    }


    $scope.showProgressiveImage = function () {
      // For progressive image feature
      setTimeout(function () {
        $('.search-result-img').each(function () {

          var image = new Image();
          var previewImage = $(this).find('.loadingImage');
          var newImage = $(this).find('.overlay');
          ImgCache.isCached(previewImage.data('image'), function (path, success) {
            if (success) {

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

  });
})

/*-------------------- MY PROFILE CONTROLLER ENDS*---------------- */