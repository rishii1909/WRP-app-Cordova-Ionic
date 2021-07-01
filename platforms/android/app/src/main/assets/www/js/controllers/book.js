//   Developer : Nitisha Sharma
//   Skype Id  : nsharma111
//   File Name : book.js
//   Purpose   : To view the magazines, books and blog section when the user is logged in.

/*-------------------- DASHBOARD CONTROLLER STARTS*--------------*/

app.controller('BookCtrl', function ($scope, $ionicPlatform, serverAPICall, $base64, CONSTANTS, $http, $location, userService, $ionicLoading, $ionicHistory, $cordovaDialogs, $rootScope, $ionicModal, $cordovaSQLite, $q, $cordovaFile, $cordovaFileTransfer, manageRecords, selectRecords, checkRecords, deleteRecords, setUpdateTime, $interval, checkNetConn, $state, $ionicPopup, $timeout, selectCommonRecords, selectCommonRecordsBook, downloadAsset, $cordovaToast, $ionicScrollDelegate, $compile) {
	ionic.Platform.ready(function () {
		$scope.resultTextBook = 0;
		$scope.total_records_books = localStorage.getItem("total_records_books");
		$scope.updateAvailable = [];

		$scope.bookDownloads = 0;
		$scope.showLoad = 0;

		$scope.downloadQueue = angular.fromJson(localStorage.getItem('downloadQueueBooks'));
		$rootScope.downloadDataBooks = angular.fromJson(localStorage.getItem('downloadDataBooks'));

		$scope.$watch(function () {
			checkNetConn.checkConn();
			return checkNetConn.getConn();
		}, function (value) {
			var refreshStatus = angular.fromJson(localStorage.getItem('booksRefreshed'));
			if (value == 'none') {
				$scope.conStatus = value;
				$scope.progressDiv = false;
				$scope.showProgress = false;

				document.getElementById("pageHeadingBook").innerHTML = "My Downloads";

				// If data is not refreshed show alert
				if (refreshStatus != null && !refreshStatus) {
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
						title: ' <i class="icon ion-alert placeholder-icon"></i>',
						template: 'Connection lost, books will be refreshed once connected.',
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
				$scope.downloadQueue = angular.fromJson(localStorage.getItem('downloadQueueBooks'));
				
				var template = `<div class="float-l">My Downloads</div><div class="move_available_container">
					<button id="move_btn" ng-click="jumpToAvailable()">
						<span>
							<img src="img/header-back.jpg" id="move_down_arrow"/>
						</span>
						<span>Available Books</span>
					</button>
					</div>`;
				angular.element(document.getElementById("pageHeadingBook")).html($compile(template)($scope));

				// If data is not refreshed refresh data now.
				if (refreshStatus != null && !refreshStatus) {
					$scope.refreshData();
				}
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

		$scope.checkDownloads = function () {
			$scope.bookDownloads = 0;
			$scope.showLoad = 0;
			var asset_query = "SELECT id, usersUniqueID, asset_id,subtype, version FROM userAssets WHERE usersUniqueID = ? AND downloadStatus = ? AND subtype=?";
			$cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, true, 'book']).then(function (Queryres) {
				$scope.showLoad = 1;
				if (Queryres.rows.length > 0) {
					$scope.bookDownloads = Queryres.rows.length;
					$scope.tempArray = [];
					for (var i = 0; i < Queryres.rows.length; i++) {
						$scope.tempArray.push(Queryres.rows.item(i));
					}
				} else {
					$scope.bookDownloads = 0;
				}

				if ($scope.timeToLoadImages()) {
					$scope.showProgressiveImage();
				}

			}, function (err) { });
		}

		$scope.checkForUpdate = function () {
			$scope.updateAvailable = [];

			if ($scope.tempArray) {
				if ($scope.tempArray.length > 0) {
					for (var i = 0; i < $scope.tempArray.length; i++) {
						for (var j = 0; j < $scope.dashboardMyBooks.length; j++) {
							if ($scope.tempArray[i].asset_id == $scope.dashboardMyBooks[j].book_id) {
								if ($scope.tempArray[i].version < $scope.dashboardMyBooks[j].version) {
									if ($scope.updateAvailable.indexOf($scope.dashboardMyBooks[j].book_id) == -1) {
										$scope.updateAvailable.push($scope.dashboardMyBooks[j].book_id);
									}
								}
							}
						}
					}
					localStorage.setItem('updateAvailableBooks', angular.toJson($scope.updateAvailable));
					if (($scope.updateAvailable.length > 0) && ($scope.conStatus != "none")) {
						$scope.autoUpdate();
					}
				}
			}
		}

		//============ FOR COMPLETE BOOKS AT ONCE
		$scope.getAllBookData = function () {
			$scope.total_records_books = localStorage.getItem("total_records_books");
			$scope.allBooks = [];
			selectCommonRecordsBook.getAllBooks($scope.userData.usersUniqueID, 0, $scope.total_records_books)
				.then(function (result) {
					$scope.allBooks = result;
					$scope.checkForUpdate();
					$scope.removeUnpurchased($scope.allBooks);
				});
		}

		$scope.removeUnpurchased = function (dataToCompare) {
			var downloadedData = [];
			var asset_query = "SELECT id, sku, usersUniqueID, asset_id, subtype, version, isPurchased FROM userAssets WHERE usersUniqueID = ? AND downloadStatus = ? AND subtype=?";
			$cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, true, 'book']).then(function (Queryres) {
				for (var i = 0; i < Queryres.rows.length; i++) {
					downloadedData.push(Queryres.rows.item(i));
					let index = dataToCompare.findIndex(function (value, index) {
						return value.sku == downloadedData[i].sku;
					})
					if (index != -1) {
						if (downloadedData[i].isPurchased.toString() != dataToCompare[index].isPurchased.toString()) {
							let data = downloadedData[i];
							$cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', data.subtype + '_' + data.sku).then(function (result) {
								var asset_query = "DELETE FROM userAssets WHERE usersUniqueID =? AND asset_id = ? AND sku = ? AND subtype =?";
								$cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, data.asset_id, data.sku, data.subtype]).then(function (res_query) {
									$cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', data.subtype + '_cover_' + data.sku).then(function (res) {
										$rootScope.no_of_book_updated = 1;
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

		$scope.getAllDataBooks = function () {
			//show small spinner 
			var bookUpdateTime = localStorage.getItem("bookUpdateTime");
			$scope.showLoad = 0;
			if (bookUpdateTime == null || bookUpdateTime == '') {
				$ionicLoading.show({
					template: CONSTANTS.SPINNER
				});
			}


			manageRecords.setAssetsBooks($scope.userData.usersUniqueID)
				.then(function (result) {
					$timeout(function () {
						var newLimit = parseInt($scope.limitTillBook) + parseInt($scope.offsetValBook);
						selectCommonRecordsBook.getAllBooks($scope.userData.usersUniqueID, 0, newLimit)
							.then(function (result) {
								$scope.dashboardMyBooks = [];
								$scope.dashboardAvailBooks = [];
								$scope.showLoad = 1;

								$ionicHistory.clearCache($state.current.name).then(function () {
									$ionicHistory.clearHistory();
								});

								for (var i = 0; i < result.length; i++) {
									if (result[i].isPurchased == "true") {
										$scope.dashboardMyBooks.push(result[i]);
									} else {
										$scope.dashboardAvailBooks.push(result[i]);
									}

								}

								$scope.showProgressiveImage();
								if ($scope.dashboardMyBooks.length > 0) {
									$scope.resultTextBook = 1;
								}

								$ionicLoading.hide();
							});
						$scope.getAllBookData();
					}, 2500);
				});

		}

		$scope.timeToLoadImages = function () {
			var bookUpdateTime = localStorage.getItem("bookUpdateTime");
			var thisTimeBook = Date.now();

			if (bookUpdateTime == null) {
				return true;
			}

			var timeElapsedBook = (thisTimeBook - bookUpdateTime) / 1000;
			var timeElapsedBook = Math.round(timeElapsedBook);

			$scope.refreshCheckBook = $rootScope.refreshCheckBook;
			if ($scope.refreshCheckBook == 2 && timeElapsedBook < 200) {
				return true;
			} else {
				return false;
			}
		}

		$scope.$on("$ionicView.enter", function (scopes, states) {
			var refreshStatus = angular.fromJson(localStorage.getItem('booksRefreshed'));
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

			$scope.downloadQueue = angular.fromJson(localStorage.getItem('downloadQueueBooks'));
			if ($scope.userData == null || $scope.userData == "undefined" || $scope.userData.usersUniqueID == "" || $scope.userData.usersUniqueID == "undefined" || $scope.userData.usersUniqueID == null) {
				$location.path("/login");
			} else {
				$location.path("/tab/book");
			}

			$scope.progressDiv = angular.fromJson(localStorage.getItem('progressDivBooks'));
			//after download code starts
			$scope.showProgress = localStorage.getItem("showProgress");
			$scope.total_records_books = localStorage.getItem("total_records_books");

			if ($rootScope.no_of_book_updated == 1) {
				$scope.userData = angular.fromJson(userService.getUserData());

				$scope.offsetValBook = 0;
				var offsetValBook = $scope.offsetValBook;

				$scope.offsetValBook = parseInt(localStorage.getItem("offsetValBook"));

				var limitTillBook = $scope.offsetValBook + $scope.limitTillBook;

				$scope.checkDownloads();
				$ionicLoading.show({
					template: CONSTANTS.SPINNER
				});

				$scope.showLoad = 0;
				selectCommonRecordsBook.getAllBooks($scope.userData.usersUniqueID, offsetValBook, limitTillBook)
					.then(function (result) {
						$rootScope.no_of_book_updated = 0;
						$scope.progressDiv = angular.fromJson(localStorage.getItem("showProgress"));
						$scope.dashboardMyBooks = [];
						$scope.dashboardAvailBooks = [];

						$scope.showLoad = 1;
						for (var i = 0; i < result.length; i++) {

							if (result[i].isPurchased == "true") {
								$scope.dashboardMyBooks.push(result[i]);
							} else {
								$scope.dashboardAvailBooks.push(result[i]);
							}

						}
						if ($scope.dashboardMyBooks.length > 0) {
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
			$scope.limitTillBook = localStorage.getItem("limitTillBook");
			$scope.offsetValBook = angular.fromJson(localStorage.getItem("offsetValBook"));
			$scope.showProgress = localStorage.getItem("showProgress");


			var bookUpdateTime = localStorage.getItem("bookUpdateTime");
			var thisTimeBook = Date.now();

			var timeElapsedBook = (thisTimeBook - bookUpdateTime) / 1000;
			var timeElapsedBook = Math.round(timeElapsedBook);

			$scope.checkDownloads();
			if ($rootScope.previewChk != 1) {
				$scope.getAllBookData();
			} else {
				$rootScope.previewChk = 0;
			}

			$scope.refreshCheckBook = $rootScope.refreshCheckBook;
			if ($scope.refreshCheckBook == 2 && timeElapsedBook < 200) {
				localStorage.setItem("offsetValBook", 0);
				$scope.offsetValBook = localStorage.getItem("offsetValBook");

				$scope.displayDataBook($scope.offsetValBook);

			}

			//============ FOR  BOOKS WITH LIMIT

			if (timeElapsedBook > 200 && $scope.conStatus != "none") {
				if (bookUpdateTime == null || bookUpdateTime == '') {
					$ionicLoading.show({
						template: CONSTANTS.SPINNER
					});
				}
				deleteRecords.delAssetsBook($scope.userData.usersUniqueID).then(function (res) {

					deleteRecords.delAssetsBookList($scope.userData.usersUniqueID).then(function (result) {
						$scope.getAllDataBooks();
					});
				});

			}
		});

		checkNetConn.checkConn();
		$scope.userData = [];
		$scope.userData = angular.fromJson(userService.getUserData());

		$scope.conStatus = checkNetConn.getConn();



		$scope.total_records_books = localStorage.getItem("total_records_books");
		$scope.progressDiv = false;
		$scope.bookDownloads = 1;
		$scope.flag_book = false;
		$scope.filterOn_book = false;
		$scope.sortOn_book = false;
		$scope.searchStatus_book = 0;
		$scope.dwnStatus_book = "false";
		$scope.hideLoad_book = 'true';
		$scope.bookList = [];
		$scope.dashboardMyBooks = [];
		$scope.dashboardAvailBooks = [];
		$scope.spinVal_book = 0;
		$scope.allBooks = [];
		$scope.updateBookData = 0;
		$scope.showLoad = 0;


		var bookUpdateTime = localStorage.getItem("bookUpdateTime");
		$scope.limitTillBook = localStorage.getItem("limitTillBook");

		$scope.offsetValBook = localStorage.getItem("offsetValBook");

		$scope.total_records_books = localStorage.getItem("total_records_books");
		if ($scope.total_records_books) {

			if (parseInt($scope.offsetValBook) + 20 >= parseInt($scope.total_records_books)) {
				$scope.hideLoad_book = 'true';
			}
		}

		$scope.checkDownloads();

		manageRecords.getBooksData($scope.userData.usersUniqueID).then(function (result) {
			$scope.removeUnpurchased(result);
		}, function (error) { });

		//======= FOR COMMON DATA START WITH LIMIT AND OFFSET================

		$scope.displayDataBook = function (offsetValBook) {
			var dataLengthBook = parseInt($scope.dashboardMyBooks.length) + parseInt($scope.dashboardAvailBooks.length);

			if ((offsetValBook == 0 && dataLengthBook == 0) || $scope.updateBookData == 1 || $scope.refreshCheckBook == 2) {
				$scope.dashboardMyBooks = [];
				$scope.dashboardAvailBooks = [];
				$scope.showLoad = 0;

				$ionicLoading.show({
					template: CONSTANTS.SPINNER
				});

				selectCommonRecordsBook.getAllBooks($scope.userData.usersUniqueID, $scope.offsetValBook, $scope.limitTillBook)
					.then(function (result) {
						$scope.dashboardMyBooks = [];
						$scope.dashboardAvailBooks = [];
						$scope.showLoad = 1;

						$scope.showProgressiveImage();

						for (var i = 0; i < result.length; i++) {
							if (result[i].isPurchased == 'true') {
								$scope.dashboardMyBooks.push(result[i]);
							} else if (result[i].isPurchased == 'false') {
								$scope.dashboardAvailBooks.push(result[i]);

							}

						}
						if ($scope.dashboardMyBooks.length > 0) {
							$scope.resultTextBook = 1;
						}
						$rootScope.refreshCheckBook = 0;
						$scope.updateBookData = 0;
						$ionicLoading.hide();
					});
				$scope.spinVal_book = 0;




			}


		}
		$scope.getBookList = function () {
			$ionicLoading.show({
				template: CONSTANTS.SPINNER
			});

			$scope.bookList = [];

			selectRecords.getBookList()
				.then(function (result) {
					$scope.bookList = result;
					$ionicLoading.hide();
				});
		}




		$scope.displayDataBook($scope.offsetValBook);

		$scope.getAllBookData();


		//======= FOR COMMON DATA END================
		$scope.loadMoreBooks = function () {
			$scope.hideLoad_book = 'true';
			$scope.spinVal_book = 1;



			$scope.offsetValBook = parseInt($scope.offsetValBook) + 20;
			localStorage.setItem("offsetValBook", $scope.offsetValBook);
			selectCommonRecordsBook.getAllBooks($scope.userData.usersUniqueID, $scope.offsetValBook, $scope.limitTillBook)
				.then(function (result) {
					$scope.tempMyDataBook = [];
					$scope.tempAvailDataBook = [];


					for (var i = 0; i < result.length; i++) {

						if (result[i].isPurchased == "true") {
							$scope.tempMyDataBook.push(result[i]);
							if ($scope.dashboardMyBooks.indexOf(result[i] == -1)) {
								$scope.dashboardMyBooks.push(result[i]);
							}
						} else {
							$scope.tempAvailDataBook.push(result[i]);
							if ($scope.dashboardAvailBooks.indexOf(result[i] == -1)) {
								$scope.dashboardAvailBooks.push(result[i]);
							}
						}

					}
					$timeout(function () {
						$scope.spinVal_book = 0;
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
				$state.go('tab.book');
			}

			return false;
		}

		//-------------FOR PREVIEW FUNCTIONALITY ENDS-------------
		//-------------FOR AUTO-UPDATE FUNCTIONALITY STARTS------------

		$scope.autoUpdate = function () {
			for (var j = 0; j < $scope.updateAvailable.length; j++) {
				var index = $scope.dashboardMyBooks.findIndex(function (item, i) {
					return item.book_id === $scope.updateAvailable[j];
				});

				var oldDataIndex = $scope.tempArray.findIndex(function (item, i) {
					return item.asset_id === $scope.updateAvailable[j];
				});

				var data = $scope.dashboardMyBooks[index];
				var oldData = {
					asset_id: $scope.tempArray[oldDataIndex].asset_id,
					version: $scope.tempArray[oldDataIndex].version,
					coverPath: data.coverPath,
					downloadPath: data.downloadPath,
					sku: data.sku
				}
				$scope.download(data.sku, data.urlZipFile, data.book_id, data.version, data.urlImageThumb, '', '', data.title, true, oldData) // Set isUpdating to true for update
			}
		}

		//-------------FOR AUTO-UPDATE FUNCTIONALITY ENDS------------

		//-------------FOR BOOK DOWNLOADS FUNCTIONALITY STARTS-----------

		$scope.download = function (id, srcUrl, asset_id, version, thumbnail, indexVal, forArray, title, isUpdating = false, oldData = {}) {
			$scope.downloadQueue = angular.fromJson(localStorage.getItem('downloadQueueBooks'));
			$rootScope.downloadDataBooks = angular.fromJson(localStorage.getItem('downloadDataBooks'));

			let dataIndex = $scope.dashboardMyBooks.findIndex(function (item, i) {
				return item.asset_id == asset_id;
			});

			if (dataIndex != -1) {
				if ($scope.dashboardMyBooks[dataIndex].downloadStatus == 'true' || $scope.dashboardMyBooks[dataIndex].downloadStatus == true) {
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
			var srcUrl = srcUrl;
			var asset_id = asset_id;
			var version = version;
			var thumbnail = thumbnail;
			var indexVal = indexVal;
			var usersUniqueID = $scope.userData.usersUniqueID;

			if (!isUpdating) {
				$scope.progressDiv = true;
				$scope.showProgress = true;
				localStorage.setItem('progressDivBooks', $scope.progressDiv);

				if (($scope.downloadQueue.indexOf(asset_id) == -1) || ($scope.downloadQueue.indexOf(parseInt(asset_id)) == -1)) {
					$scope.downloadQueue.push(parseInt(asset_id));
					let index = $rootScope.downloadDataBooks.findIndex(function (item, i) {
						return item.asset_id == asset_id;
					});
					if (index == -1) {
						$rootScope.downloadDataBooks.push(downloadData);
					}
					$scope.downloadQueue = [... new Set($scope.downloadQueue)];
					localStorage.setItem('downloadQueueBooks', angular.toJson($scope.downloadQueue));
					localStorage.setItem('downloadDataBooks', angular.toJson($rootScope.downloadDataBooks));
				}

				if ($scope.downloadQueue.length == 1) {
					toastMsg = "Download started";
					downloadAsset.downloadMagazine(id, srcUrl, asset_id, version, thumbnail, indexVal, forArray, usersUniqueID, 'book', title, isUpdating, oldData);
				} else {
					toastMsg = "Added to queue";
				}

				$cordovaToast.show(toastMsg, "short", "bottom").then(function (success) {

				}, function (error) {

				});

			} else {
				var updateQueue = angular.fromJson(localStorage.getItem('updateQueueBooks'));
				var updateData = angular.fromJson(localStorage.getItem('updateDataBooks'));

				if (updateQueue.indexOf(asset_id) == -1) {
					updateQueue.push(parseInt(asset_id));
					updateData.push(downloadData);
					if (updateQueue.length == 1) {
						downloadAsset.downloadMagazine(id, srcUrl, asset_id, version, thumbnail, indexVal, forArray, usersUniqueID, 'book', title, isUpdating, oldData);
					}
				}

				localStorage.setItem('updateQueueBooks', angular.toJson(updateQueue));
				localStorage.setItem('updateDataBooks', angular.toJson(updateData));
			}
		}

		//-------------FOR BOOK DOWNLOADS FUNCTIONALITY ENDS-----------


		//=====================Handling delete for downloads START ===============

		//--------------------- SHOWING DOWNLOAD PROGRESS TEST
		$scope.deleteAsset = function (sku, asset_id, version, indexVal, forArray) {
			$ionicLoading.show({
				template: CONSTANTS.SPINNER
			});
			var indexVal = indexVal;
			var asset_query = "DELETE FROM userAssets WHERE usersUniqueID =? AND asset_id = ? AND sku = ? AND subtype =?";
			$cordovaSQLite.execute(dbCon, asset_query, [$scope.userData.usersUniqueID, asset_id, sku, 'book'])
				.then(function (res_query) {
					$cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', 'book_' + sku).then(function (result) {
						$ionicLoading.hide();

						var alertPopup = $ionicPopup.alert({
							title: ' <i class="icon ion-checkmark placeholder-icon"></i>',
							template: 'Book removed from downloads.',
							buttons: [{
								text: '<b>OK</b>',
								type: 'button-green',
							}]
						});

						alertPopup.then(function (res) {

							$cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', 'book_cover_' + sku).then(function (res) {
								$ionicLoading.hide();

								if (forArray == 'dashboardMyBooks') {

									// for (var i = 0; i < $scope.dashboardMyBooks.length; i++) {
									// 	if ($scope.dashboardMyBooks[i].book_id == asset_id) {
									// 		$scope.dashboardMyBooks[i].downloadStatus = "false";
									// 		$scope.dashboardMyBooks[i].downloadPath = '';
									// 		$scope.dashboardMyBooks[i].coverPath = '';
									// 	}

									// }
									// $scope.checkDownloads();
									// $scope.getAllBookData();
									$scope.updateRecords();

								} else if (forArray == 'topicBookResult') {

									for (var i = 0; i < $scope.topicBookResult.length; i++) {
										if ($scope.topicBookResult[i].book_id == asset_id) {
											$scope.topicBookResult[i].downloadStatus = "false";
											$scope.topicBookResult[i].downloadPath = '';
											$scope.topicBookResult[i].coverPath = '';
											$scope.updateBookData = 1;
										}

									}
									$scope.checkDownloads();
									if ($scope.offsetValBook > 0) {
										$scope.offsetValBook = $scope.offsetValBook - 20;
										localStorage.setItem("offsetValBook", $scope.offsetValBook);
									}
									$scope.displayDataBook($scope.offsetValBook);
									$scope.getAllBookData();

								} else if (forArray == 'allBooks') {

									for (var i = 0; i < $scope.allBooks.length; i++) {
										if ($scope.allBooks[i].book_id == asset_id) {
											$scope.allBooks[i].downloadStatus = "false";
											$scope.allBooks[i].downloadPath = '';
											$scope.allBooks[i].coverPath = '';
											$scope.updateBookData = 1;
										}

									}
									$scope.checkDownloads();
									$scope.displayDataBook($scope.offsetValBook);

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
					$scope.updateRecords();
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

				}
			})

			//----------------------- Updating Status of downloads in database ends=============
		}

		//=====================Handling delete for downloads ENDS ===============
		//================ Handling Filter and Sort STARTS================================

		$scope.bookList = [{
			'id': '1',
			'sku': 'Modeling',
			'title': 'All Modeling'
		},
		{
			'id': '2',
			'sku': 'Prototype',
			'title': 'All Prototype'
		},
		{
			'id': '3',
			'sku': 'Narrow Gauge',
			'title': 'Narrow Gauge'
		},
		{
			'id': '4',
			'sku': 'Annuals',
			'title': 'Annuals'
		}
		];



		$scope.filterValBook = [];

		$scope.updateChkValueBook = function (val, index) {
			$scope.bookList[index].checked = val.checked;
			$scope.topicsBook.value = 'false';


			$scope.filterValBook[index] = val.checked;
			var temp_book = $scope.filterValBook.indexOf(true);

			if (temp_book == -1) {
				$scope.flag_book = false;
			} else {
				$scope.flag_book = true;
			}
		}

		$scope.topicsBook = [];
		$scope.topicBookResult = [];
		$scope.pageStatusBook = '';
		$scope.statusBook = '';
		$scope.noResultBook = '';
		$scope.filterLimitBook = 20;
		$scope.filterLoaderBook = 'true';

		$scope.filter_itBook = function (resValue) {
			$scope.noResultBook = false;
			$scope.filterData = [];

			var netCon = checkNetConn.checkConn();
			$scope.conStatus = checkNetConn.getConn();
			if ($scope.conStatus == 'none') {
				$scope.allBooks = $scope.dashboardMyBooks;
			}

			$scope.noResultBook = false;
			$scope.filterOn_book = true;

			//Set scroll to top
			$scope.scrolltoTop();

			if (resValue == true) {
				$scope.resvalue = "true";
				$scope.statusBook = "My";
			} else if (resValue == false) {
				$scope.resvalue = "false";
				$scope.statusBook = "Available";

				// When connection is not available show no records for not purchased books
				if ($scope.conStatus == "none") {
					$scope.topicBookResult = [];
					$scope.noResultBook = true;
					$scope.searchStatus_book = 1;
					$scope.pageStatusBook = $scope.statusBook + ' Books';
					$scope.closeWithoutRemoveBook();
					$scope.filterOn_book = true;
					return;
				}
			} else {
				$scope.resvalue = "all";
				$scope.statusBook = "All";
			}



			$scope.tempRadioBook = [];
			$scope.tempValBook = [];
			$scope.pattern = [];

			for (var i = 0; i < $scope.bookList.length; i++) {
				if ($scope.bookList[i].checked) {
					$scope.tempValBook[i] = true;
				} else {
					$scope.tempValBook[i] = false;
				}

			}

			for (var i = 0; i < $scope.bookList.length; i++) {
				if ($scope.bookList[i].checked == true) {
					$scope.pattern.push($scope.bookList[i].sku);
				}
			}
			var tempVariable = $scope.pattern.toString();

			var res = tempVariable.replace(/,/g, "%' OR b.metadata Like '%");
			res = "(b.metadata Like '%" + res + "%')";
			if ($scope.conStatus != "none") {
				if ($scope.resvalue == "true") {
					$scope.topicBookResult = [];

					var query_my = "SELECT b.book_id, b.title, b.isPurchased, b.metadata, b.sku, b.urlImageThumbSmall, b.urlImageThumb, b.price, b.urlToContent, b.shopifyURL, b.year, b.version, b.urlZipFile, a.asset_id, a.usersUniqueID, a.coverPath, CASE WHEN a.asset_id = b.book_id THEN a.downloadStatus ELSE b.downloadStatus END AS 'downloadStatus', CASE WHEN a.asset_id = b.book_id THEN a.downloadPath ELSE b.downloadPath END AS 'downloadPath' FROM books b LEFT JOIN userAssets a on a.asset_id = b.book_id AND a.subtype = 'book' WHERE b.isPurchased = 'true' AND " + res;

					$cordovaSQLite.execute(dbCon, query_my, []).then(function (Queryres) {

						if (Queryres.rows.length > 0) {
							for (var i = 0; i < Queryres.rows.length; i++) {
								$scope.topicBookResult.push(Queryres.rows.item(i));
							}
						} else {
							$scope.noResultBook = true;
						}

					}, function (err) { });

				} else if ($scope.resvalue == "false") {

					var query_av = "SELECT b.book_id, b.title, b.isPurchased, b.metadata, b.sku, b.urlImageThumbSmall, b.urlImageThumb, b.price, b.urlToContent, b.shopifyURL,b.year, b.version, b.urlZipFile, b.downloadStatus FROM books b WHERE b.isPurchased = 'false' AND " + res;
					$scope.topicBookResult = [];


					$cordovaSQLite.execute(dbCon, query_av, []).then(function (Queryres) {
						if (Queryres.rows.length > 0) {
							for (var j = 0; j < Queryres.rows.length; j++) {
								$scope.topicBookResult.push(Queryres.rows.item(j));
							}
						} else {
							$scope.noResultBook = true;
						}
					}, function (error) { });


				} else if ($scope.resvalue == "all") {

					var query_all = "SELECT b.book_id, b.title, b.isPurchased, b.metadata, b.sku, b.urlImageThumbSmall, b.urlImageThumb, b.price, b.urlToContent, b.shopifyURL, b.year, b.version, b.urlZipFile, a.asset_id, a.usersUniqueID, a.coverPath, CASE WHEN a.asset_id = b.book_id THEN a.downloadStatus ELSE b.downloadStatus END AS 'downloadStatus', CASE WHEN a.asset_id = b.book_id THEN a.downloadPath ELSE b.downloadPath END AS 'downloadPath' FROM books b LEFT JOIN userAssets a on a.asset_id = b.book_id AND a.subtype = 'book' WHERE " + res;
					$scope.topicBookResult = [];

					$cordovaSQLite.execute(dbCon, query_all, []).then(function (Queryres) {

						if (Queryres.rows.length > 0) {
							for (var j = 0; j < Queryres.rows.length; j++) {
								$scope.topicBookResult.push(Queryres.rows.item(j));
							}
						} else {
							$scope.noResultBook = true;

						}
					}, function (error) { });

					$scope.showProgressiveImage();

				}
			} else {
				$scope.topicBookResult = [];
				for (var j = 0; j < $scope.allBooks.length; j++) {
					var str = $scope.allBooks[j].metadata;

					var filters = tempVariable.split(',');

					for (var i = 0; i < filters.length; i++) {
						if ((str.includes(filters[i]))) {
							if ($scope.allBooks[j].downloadStatus == 'true') {
								$scope.topicBookResult.push($scope.allBooks[j]);
							}
							break;
						}
					}

				}

				if ($scope.topicBookResult.length == 0) {
					$scope.noResultBook = true;
				}
			}




			//======================== TEST FILTER QUERY ENDS===============================


			$scope.searchStatus_book = 1;
			$scope.pageStatusBook = $scope.statusBook + ' Books';
			$scope.closeWithoutRemoveBook();
			$scope.filterOn_book = true;
		}
		$scope.loadMoreFilter = function (val) {
			$scope.spinVal_book = 1;

			if ($scope.conStatus != "none") {
				if (val < $scope.topicBookResult.length && $scope.topicBookResult.length != 0) {
					$scope.filterLimitBook = $scope.filterLimitBook + 10;
					$scope.spinVal_book = 0;
					$scope.filterLoaderBook = 'true';
				} else if ($scope.topicBookResult.length == 0 && val < $scope.total_records_books) {
					$scope.filterLimitBook = $scope.filterLimitBook + 10;
					$scope.filterLoaderBook = 'true';
					$scope.spinVal_book = 0;
				} else {
					$scope.spinVal_book = 0;
					$scope.filterLoaderBook = 'false';
				}
			} else if ($scope.conStatus == "none") {
				if (val < $scope.bookDownloads) {
					$scope.filterLimitBook = $scope.filterLimitBook + 10;
					$scope.spinVal_book = 0;
					$scope.filterLoaderBook = 'true';
				} else {
					$scope.spinVal_book = 0;
					$scope.filterLoaderBook = 'false';
				}

			}
			$timeout(function () {
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}, 5000);

			$scope.showProgressiveImage();
		}



		$scope.backDashboardBook = function () {
			$ionicLoading.show({
				template: CONSTANTS.SPINNER
			});

			var netCon = checkNetConn.checkConn();
			$scope.conStatus = checkNetConn.getConn();

			$scope.filterLimitBook = 10;
			$scope.filterOn_book = false;
			$scope.sortOn_book = false;
			$scope.noResultBook = false;
			$scope.searchStatus_book = 0;
			$scope.flag_book = false;
			$scope.topicBookResult = [];
			$scope.orderBook = null;
			$scope.filterValBook = [];

			$scope.topicsBook = [];
			$scope.tempValBook = [];
			$scope.tempRadioBook = [];
			for (var a in $scope.bookList) {
				$scope.bookList[a].checked = false;
			}
			$ionicLoading.hide();

			if ($scope.timeToLoadImages()) {
				$scope.showProgressiveImage();
			}
		}
		//============== FOR FILTER ENDS==========================

		//=============== FOR SORT STARTS=========================

		$scope.sortItBook = function (value) {
			var netCon = checkNetConn.checkConn();
			$scope.conStatus = checkNetConn.getConn();

			$scope.sortOn_book = true;
			if ($scope.topicBookResult.length == 0 && $scope.noResultBook == true) {
				$scope.noResultBook = true;
				$scope.closeWithoutRemoveBook2();
				$scope.sortOn_book = true;
				return;
			} else if ($scope.topicBookResult.length > 0) {
				if (value == 'DESC') {
					$scope.orderBook = '-title';
				} else {
					$scope.orderBook = 'title';
				}
				$scope.searchStatus_book = 1;
			} else if ($scope.topicBookResult.length == 0 && $scope.noResultBook == false) {
				if ($scope.conStatus == 'none') {
					$scope.allBooks = $scope.dashboardMyBooks;
					$scope.filterLimitBook = $scope.dashboardMyBooks.length;
				}
				if (value == 'DESC') {
					$scope.orderBook = '-title';
					$scope.pageStatusBook = "Descending";
				} else {
					$scope.orderBook = 'title';
					$scope.pageStatusBook = "Ascending";
				}
				$scope.searchStatus_book = 2;
			} else {

			}

			//Set scroll to top
			$scope.scrolltoTop();

			$scope.flag_book = true;
			$scope.closeWithoutRemoveBook2();
			$scope.sortOn_book = true;

			$scope.showProgressiveImage();
		}

		//=============== FOR SORT ENDS=========================

		//=============== HAndling Filter and Sort ENDS=========================


		// ======= FOR MODAL VIEW =======

		var init = function () {
			if ($scope.modal) {
				return $q.when();
			} else {
				return $ionicModal.fromTemplateUrl('modal1book.html', {
					scope: $scope,
					animation: 'slide-in-up',
					backdropClickToClose: true
				})
					.then(function (modal) {
						$scope.modal = modal;
					})
			}
		};

		$scope.open_book = function () {
			init().then(function () {
				$scope.modal.show();
				$scope.flag_book = false;
				// ----------FOR DISABLING THE FILTER OPTION ON CLOSE START
				if ($scope.filterOn_book == false) {

					$scope.topicsBook = [];
					for (var i = 0; i < $scope.bookList.length; i++) {
						$scope.bookList[i].checked = false;

					}
				}
				// ----------FOR DISABLING THE FILTER OPTION ON CLOSE END
				if ($scope.tempValBook) {
					for (var i = 0; i < $scope.bookList.length; i++) {
						$scope.bookList[i].checked = $scope.tempValBook[i];
						$scope.filterValBook[i] = $scope.tempValBook[i];
					}

				}

				if ($scope.tempRadioBook) {
					$scope.topicsBook.value = $scope.tempRadioBook;
				}

				//------Check For FILTER OPTIONS FILLED START
				if ($scope.filterOn_book == true) {
					$scope.flag_book = true;
				}
				//------Check For FILTER OPTIONS FILLED ENDS
			});
		};

		$scope.closeWithoutRemoveBook = function () {
			if ($scope.searchStatus_book == 1) {
				$scope.filterOn_book = true;
			} else {
				$scope.filterOn_book = false;
			}
			if ($scope.noResultBook == true) {
				$scope.noResultBook = true;
			} else {
				$scope.noResultBook = false;
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
				return $ionicModal.fromTemplateUrl('modal2book.html', {
					scope: $scope,
					animation: 'slide-in-up',
					backdropClickToClose: true
				})
					.then(function (modal) {
						$scope.modal2 = modal;
					})
			}
		};

		$scope.open_book2 = function () {
			init2().then(function () {
				$scope.modal2.show();
			});
		};
		$scope.closeWithoutRemoveBook2 = function () {
			if ($scope.searchStatus_book == 2) {
				$scope.sortOn_book = true;
			} else if ($scope.sortOn_book == true && $scope.orderBook) {
				$scope.sortOn_book == true;
			} else {
				$scope.sortOn_book = false;
			}
			$scope.modal2.hide();

			if ($scope.timeToLoadImages()) {
				$scope.showProgressiveImage();
			}
		};

		$scope.scrolltoTop = function () {
			$ionicScrollDelegate.scrollTop();
		}

		$scope.showProgressiveImage = function () {
			// For progressive image feature
			setTimeout(function () {
				$('.section-image.for-books').each(function () {

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
		};

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
			localStorage.setItem('booksRefreshed', angular.toJson(false));
			//Show loading
			$ionicLoading.show({
				template: CONSTANTS.SPINNER
			});
			// On refresh delete records first
			deleteRecords.delAssetsBook($scope.userData.usersUniqueID).then(function (res) {
				deleteRecords.delAssetsBookList($scope.userData.usersUniqueID).then(function (result) {
					//Fetch data from API
					manageRecords.setAssetsBooks($scope.userData.usersUniqueID).then(function (res) {
						$scope.total_records_books = res;
						localStorage.setItem('total_records_books', $scope.total_records_books);

						manageRecords.setBookList($scope.userData.usersUniqueID).then(function (res) {
							// Store new data.

							var limit = $scope.offsetValBook + 20;

							$ionicHistory.clearCache($state.current.name).then(function () {
								$ionicHistory.clearHistory();
							});

							selectCommonRecordsBook.getAllBooks($scope.userData.usersUniqueID, 0, limit).then(function (result) {
								$scope.dashboardMyBooks = [];
								$scope.dashboardAvailBooks = [];
								$scope.showLoad = 1;

								for (var i = 0; i < result.length; i++) {
									if (result[i].isPurchased == "true") {
										$scope.dashboardMyBooks.push(result[i]);
									} else {
										$scope.dashboardAvailBooks.push(result[i]);
									}

								}
								if ($scope.dashboardMyBooks.length > 0) {
									$scope.resultTextBook = 1;
								}
								// Handling data refreshing when sort is applied
								$scope.getAllBookData();

								// Handling data refreshing when filter is applied
								if ($scope.searchStatus == 1) {
									if ($scope.resvalue == "true") {
										$scope.filter_itBook(true);
									} else if ($scope.resValue == "false") {
										$scope.filter_itBook(false);
									} else {
										$scope.filter_itBook('all');
									}
								}
								$scope.$broadcast('scroll.refreshComplete');
								// Set refresh status in local storage
								localStorage.setItem('booksRefreshed', angular.toJson(true));
								// Show Toast message
								$cordovaToast.show("Data refreshed", "short", "bottom").then(function (success) { });

								$scope.showProgressiveImage();
								$ionicLoading.hide();
							});
						})
					}, function (error) {
						$ionicLoading.hide();
					})
				});
			});
		}
		// For refreshing data ends here

		var refreshStatus = angular.fromJson(localStorage.getItem('booksRefreshed'));
		if (refreshStatus != null && !refreshStatus) {
			$scope.refreshData();
		}

		$scope.jumpToAvailable = function () {
			
			$ionicLoading.show({
				template: CONSTANTS.SPINNER
			});

			selectCommonRecordsBook.getMyIssuesCount($scope.userData.usersUniqueID).then((myIssuesCount) => {
				$scope.offsetValBook = localStorage.getItem("offsetValBook");
				$scope.spinVal = 1;

				$scope.offsetValBook = parseInt($scope.offsetValBook) + myIssuesCount + 20;
				var offsetValBook = localStorage.setItem("offsetValBook", $scope.offsetValBook);
				selectCommonRecordsBook.getAllBooks($scope.userData.usersUniqueID, 0, $scope.offsetValBook)
					.then(function (result) {
						$scope.tempMyDataBook = [];
						$scope.tempAvailDataBook = [];

						$scope.dashboardMyBooks = [];
						$scope.dashboardAvailBooks = [];

						for (var i = 0; i < result.length; i++) {
							if (result[i].isPurchased == "true") {
								$scope.tempMyDataBook.push(result[i]);
								if ($scope.dashboardMyBooks.indexOf(result[i] == -1)) {
									$scope.dashboardMyBooks.push(result[i]);
								}
							} else {
								$scope.tempAvailDataBook.push(result[i]);
								if ($scope.dashboardAvailBooks.indexOf(result[i] == -1)) {
									$scope.dashboardAvailBooks.push(result[i]);
								}
							}

						}

						$timeout(function () {
							$ionicLoading.hide();
							var offsetTop = document.getElementById("testHeadingAvailBook").getBoundingClientRect().top;
							$ionicScrollDelegate.scrollBy(0, offsetTop - 100);
						}, 1000);
						$scope.showProgressiveImage();
					}, function(error){
						$ionicLoading.hide();
					})
			}, function(error){
				$ionicLoading.hide();
			});
		}
		
		$scope.jumpToMyIssues = function(){
			var offsetTop = document.getElementById("testHeadingBook").getBoundingClientRect().top;
			$ionicScrollDelegate.scrollBy(0, offsetTop - 100);
		}

		$scope.updateRecords = function () {
			var offsetValBook = 0;
			$scope.offsetValBook = parseInt(localStorage.getItem("offsetValBook"));

			var limitTillBook = $scope.offsetValBook + $scope.limitTillBook;

			$scope.checkDownloads();
			$ionicLoading.show({
				template: CONSTANTS.SPINNER
			});

			$scope.showLoad = 0;
			selectCommonRecordsBook.getAllBooks($scope.userData.usersUniqueID, offsetValBook, limitTillBook)
				.then(function (result) {
					$scope.progressDiv = angular.fromJson(localStorage.getItem("showProgress"));
					$scope.dashboardMyBooks = [];
					$scope.dashboardAvailBooks = [];

					$scope.showLoad = 1;
					for (var i = 0; i < result.length; i++) {

						if (result[i].isPurchased == "true") {
							$scope.dashboardMyBooks.push(result[i]);
						} else {
							$scope.dashboardAvailBooks.push(result[i]);
						}

					}
					if ($scope.dashboardMyBooks.length > 0) {
						$scope.resultText = 1;
					}
					$ionicLoading.hide();
				}, function (err) {
					$ionicLoading.hide();
				});
		}

		angular.element(document.querySelector('.myDivBook')).bind('scroll', function () {

			if ($('#testHeadingBook').offset()) {
				var divHt = $('#testHeadingBook').offset().top;

				var statusText = '';

				if (divHt < 105 || divHt == 105) {
					// document.getElementById("pageHeadingBook").innerHTML = "My Books";
					statusText = "My Books";
				} else {
					// document.getElementById("pageHeadingBook").innerHTML = "My Downloads";
					statusText = "My Downloads";
				}

				var template = `<div class="float-l">${statusText}</div><div class="move_available_container">
					<button id="move_btn" ng-click="jumpToAvailable()">
						<span>
							<img src="img/header-back.jpg" id="move_down_arrow"/>
						</span>
						<span>Available Books</span>
					</button>
					</div>`;
				angular.element(document.getElementById("pageHeadingBook")).html($compile(template)($scope));
			}else if($scope.conStatus == 'none'){
				document.getElementById("pageHeadingBook").innerHTML = "My Downloads";
			}

			if ($('#testHeadingBook').offset() && $('#testHeadingAvailBook').offset()) {
				var divHtAvail = $('#testHeadingAvailBook').offset().top;

				var statusText = '';

				if (divHtAvail < 105 || divHt == 105) {
					var template = `<div class="float-l">Available Books</div><div class="move_available_container">
					<button id="move_btn" ng-click="jumpToMyIssues()">
						<span>
							<img src="img/header-back.jpg" id="move_down_arrow" style="transform: rotate(90deg)"/>
						</span>
						<span>My Books</span>
					</button>
					</div>`;
					angular.element(document.getElementById("pageHeadingBook")).html($compile(template)($scope));
				} else {
					if (divHt < 105 || divHt == 105) {
						// document.getElementById("pageHeadingBook").innerHTML = "My Books";
						statusText = "My Books";
					} else {
						// document.getElementById("pageHeadingBook").innerHTML = "My Downloads";
						statusText = "My Downloads";
					}

					var template = `<div class="float-l">${statusText}</div><div class="move_available_container">
						<button id="move_btn" ng-click="jumpToAvailable()">
							<span>
								<img src="img/header-back.jpg" id="move_down_arrow"/>
							</span>
							<span>Available Books</span>
						</button>
						</div>`;
					angular.element(document.getElementById("pageHeadingBook")).html($compile(template)($scope));
				}
			}
		});
	})
})