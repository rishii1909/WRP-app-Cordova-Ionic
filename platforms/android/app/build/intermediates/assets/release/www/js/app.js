// Developer : Nitisha Sharma
// Skype Id  : nsharma111
// File Name : app.js
// Purpose   : 
var dbCon = null;
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.constants', 'base64', 'ngCordova', 'ngMessages', 'ngAnimate', 'ngImgCache', 'ngRoute'])

  .run(function ($rootScope, $ionicPlatform, CONSTANTS, userService, $ionicConfig, serverAPICall, $base64, $http, $cordovaDialogs, $timeout, $location, $cordovaSQLite, $ionicLoading, $state, $ionicPopup, $ionicHistory) {
    $ionicPlatform.ready(function () {

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard ,'ionicLazyLoad'
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      // FOR SQLite Database 

      if (window.cordova) {

        $ionicLoading.show();

        dbCon = $cordovaSQLite.openDB({ name: "wrp.db", location: "default", bgType: 1, androidDatabaseImplementation: 2 });
        $cordovaSQLite.execute(dbCon, "CREATE TABLE IF NOT EXISTS users (user_id integer primary key, usersUniqueID integer, firstname text, lastName text, company text, emailaddress text, image_option_id integer, isLogged integer)");

        $cordovaSQLite.execute(dbCon, "CREATE TABLE IF NOT EXISTS userAssets(id integer primary key, usersUniqueID integer, asset_id integer, sku text, version integer, isPurchased text, downloadStatus text, downloadPath text, coverPath text UNIQUE, subtype text)");

        $cordovaSQLite.execute(dbCon, "CREATE TABLE IF NOT EXISTS magazines (magazine_id integer primary key, title text, isPurchased text, metadata text, price float, productCode text, shopifyURL text, year integer, unit integer, urlImageThumbSmall text, urlImageThumb text, urlZipFile text, urlToContent text, latestUp integer, sku text, urlImageFull text, downloadStatus text, downloadPath text, version integer, coverPath text)");

        $cordovaSQLite.execute(dbCon, "CREATE TABLE IF NOT EXISTS magazineList (id integer primary key, sku text, price real, title text, metadata text, productCode text, unit integer, urlImageThumbSmall text, urlImageThumb text, shopifyURL text, version real)");

        $cordovaSQLite.execute(dbCon, "CREATE TABLE IF NOT EXISTS books (book_id integer primary key, title text, isPurchased text, metadata text, price float, productCode text, shopifyURL text, year integer, unit integer, urlImageThumbSmall text, urlImageThumb text, urlZipFile text, urlToContent text, latestUp integer, sku text, urlImageFull text, downloadStatus text, downloadPath text, version integer, coverPath text)");


        $cordovaSQLite.execute(dbCon, "CREATE TABLE IF NOT EXISTS bookList (id integer primary key, sku text, price real, title text, metadata text, productCode text, year integer, unit integer, urlImageThumbSmall text, urlImageThumb text, shopifyURL text, version real)");

        $ionicLoading.hide();
      }
      else {

        dbCon = window.openDatabase("my.db", '1', 'my', -1); // browser

      }

      var conStatus = navigator.connection.type;
      localStorage.setItem("netStatus", conStatus);

      localStorage.setItem("limitTill", 20);
      localStorage.setItem("offsetVal", 0);
      localStorage.setItem("limitTillBook", 20);
      localStorage.setItem("offsetValBook", 0);

      localStorage.setItem("showProgress", 'false');

      localStorage.setItem('progressDivMags', false);
      localStorage.setItem('progressDivBooks', false);
      localStorage.setItem('updateProgressDivMags', false);
      localStorage.setItem('updateProgressDivBooks', false);

      localStorage.setItem('updateAvailableMags', angular.toJson([]));
      localStorage.setItem('updateAvailableBooks', angular.toJson([]));

      localStorage.setItem('downloadQueueMags', angular.toJson([]));
      localStorage.setItem('downloadQueueBooks', angular.toJson([]));
      localStorage.setItem('downloadDataMags', angular.toJson([]));
      localStorage.setItem('downloadDataBooks', angular.toJson([]));

      localStorage.setItem('updateQueueMags', angular.toJson([]));
      localStorage.setItem('updateQueueBooks', angular.toJson([]));
      localStorage.setItem('updateDataMags', angular.toJson([]));
      localStorage.setItem('updateDataBooks', angular.toJson([]));
      
      $rootScope.previewChk = 0;
      $rootScope.refreshCheckMagazine = 0;
      $rootScope.refreshCheckBook = 0;

      $rootScope.no_of_magazine_updated = 0;
      $rootScope.no_of_book_updated = 0;

    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {

      var retreiveuserinfo = JSON.parse(localStorage.getItem("userData"));
      var userData = angular.fromJson(retreiveuserinfo);
      if (userData) {
        var usersUniqueID = userData.usersUniqueID;
      }


      if (toState.url == '/login' && (usersUniqueID != undefined || usersUniqueID != null)) {
        event.preventDefault();
        $state.go('tab.dash');

        if (fromState.url == '/book') {
          $state.go('tab.book');
        }

        if (fromState.url == '/search') {
          $state.go('search');
        }
      }
      else if (toState.url == '/my-profile' && (usersUniqueID == undefined || usersUniqueID == null)) {
        event.preventDefault();
        $state.go('login');
      }

    });



  })

  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $routeProvider) {


    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })


      // Start with HTML designing for WRP
      // setup an abstract state for the tabs directive

      .state('login', {
        cache: false,
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      .state('forgot-password', {
        cache: false,
        url: '/forgot-password',
        templateUrl: 'templates/forgot-password.html',
        controller: 'ForgotPasswordCtrl'
      })

      .state('change-password', {
        cache: false,
        url: '/change-password',
        templateUrl: 'templates/change-password.html',
        controller: 'ChangePasswordCtrl'
      })

      .state('my-profile', {
        cache: false,
        url: '/my-profile',
        templateUrl: 'templates/my-profile.html',
        controller: 'MyProfileCtrl'
      })
      .state('search', {
        cache: true,
        url: '/search',
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl'
      })
      .state('downloads', {
        cache: false,
        url: '/downloads',
        templateUrl: 'templates/downloads.html',
        controller: 'DownloadCtrl'
      })
      .state('tab.dash', {
        cache: true,
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-magazine.html',
            controller: 'MagazineCtrl'
          }
        }
      })


      .state('tab.book', {
        cache: true,
        url: '/book',
        views: {
          'tab-book': {
            templateUrl: 'templates/tab-book.html',
            controller: 'BookCtrl'
          }
        }
      })
      .state('tab.about', {
        cache: true,
        url: '/about',
        views: {
          'tab-about': {
            templateUrl: 'templates/tab-about.html',
            controller: 'AboutCtrl'
          }
        }
      })

      .state('magazine-preview', {
        cache: false,
        url: '/magazine-preview',
        template: '<div ui-view></div>'
      })
      // .state('magazine-preview.magazine_id', {
      //   url: '/{magazine_id:[0-9]{1,4}}',
      //   templateUrl: 'templates/magazine-preview.html',
      //   controller: 'PreviewCtrl'
      // })


      .state('magazine-preview-full', {
        url: '/preview/:info_id',
        cache: false,
        templateUrl: 'templates/magazine-preview-full.html',
        controller: 'PreviewFullCtrl'
      })
      .state('read-online-full', {
        url: '/readfull/:info_id',
        cache: false,
        templateUrl: 'templates/read-online-full.html',
        controller: 'PreviewFullCtrl'
      })

    //if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

    $ionicConfigProvider.tabs.style('standard');
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.views.maxCache(2);
  });