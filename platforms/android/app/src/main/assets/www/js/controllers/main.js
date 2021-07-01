
  // Developer : Nitisha Sharma
  // Skype Id  : nsharma111
  // File Name : index.html
  // Purpose   : 

var app=angular.module('starter.controllers', ['starter.constants'])

app.controller('MainCtrl', function($scope,$ionicPlatform,serverAPICall,$base64,CONSTANTS,$http,$location,userService,$ionicLoading,$ionicHistory,$rootScope, $q, $state){
  $scope.header = {url:'templates/header.html'};
  var retreiveuserinfo = JSON.parse(localStorage.getItem("userData"));
  $scope.userData = angular.fromJson(retreiveuserinfo);
  $scope.showHelp = false;

  $rootScope.$on('$stateChangeStart', function(event, toState, fromState) {
    $scope.state = toState.url;
  });

  $scope.back = function () {
    $scope.backView = $ionicHistory.backView();
    if($scope.backView == null || $scope.backView.backViewId == null)
    {
      $location.path("/tab/dash");
    }
    else
    {
      $ionicHistory.goBack();
    }
  };

  $scope.showHelpPopup = function(show){    
    $scope.showHelp = show;
  }
  
});