//   Developer : Nitisha Sharma
//   Skype Id  : nsharma111
//   File Name : change-password.js
//   Purpose   : To change the password, when the user is logged in.

/*-------------------- CHANGE PASSWORD CONTROLLER STARTS*--------------*/

app.controller('ChangePasswordCtrl', function ($scope, serverAPICall, $base64, CONSTANTS, $http, $location, userService, $ionicLoading, $ionicHistory, $cordovaDialogs, $rootScope, checkNetConn, $ionicPopup) {

  ionic.Platform.ready(function () {
    var clientHeight = 250;
    var green_band_ht = $('.getContentHeight').height();

    var extra_space = green_band_ht - clientHeight;
    var extra_space_top = extra_space / 2;

    $(".inner-green-band").css("padding-top", extra_space_top + "px");
    $(".inner-green-band").css("padding-bottom", extra_space_top + "px");

    $scope.ChangePasswordData = [];

    $scope.userData = [];
    $scope.userData = angular.fromJson(userService.getUserData());

    if ($scope.userData == null || $scope.userData == "undefined" || $scope.userData.usersUniqueID == "" || $scope.userData.usersUniqueID == "undefined" || $scope.userData.usersUniqueID == null) {

      $location.path("/login");
    }

    $scope.$on("$ionicView.enter", function (scopes, states) {
      //after download code starts
      $scope.showProgress = localStorage.getItem("showProgress");
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

    $scope.conStatus = checkNetConn.getConn();

    $scope.back = function () {
      $scope.backView = $ionicHistory.backView();
      if ($scope.backView == null) {
        $location.path("/my-profile");
      }
      else {
        $ionicHistory.goBack();
      }

    };



    $scope.inputType_1 = 'password';
    $scope.eyeImg_1 = 'icon ion-eye';

    $scope.inputType_2 = 'password';
    $scope.eyeImg_2 = 'icon ion-eye';
    // Hide & show password function
    $scope.hideShowPassword = function (eye_id) {
      if (eye_id == 1) {
        if ($scope.inputType_1 == 'password') {
          $scope.eyeImg_1 = 'icon ion-eye-disabled';
          $scope.inputType_1 = 'text';
        }
        else {
          $scope.eyeImg_1 = 'icon ion-eye';
          $scope.inputType_1 = 'password';
        }

      }
      else {
        if ($scope.inputType_2 == 'password') {
          $scope.eyeImg_2 = 'icon ion-eye-disabled';
          $scope.inputType_2 = 'text';
        }
        else {
          $scope.eyeImg_2 = 'icon ion-eye';
          $scope.inputType_2 = 'password';
        }

      }


    };
    $scope.change_password = function () {

      if ($scope.ChangePasswordData.newPassword != $scope.ChangePasswordData.confirmPassword) {
        $scope.ChangePasswordData.confirmPassword = '';
        $cordovaDialogs.alert('Issue while confirming the New Password.', 'Error', 'Ok');
        return false;
      }
      if ($scope.ChangePasswordData.newPassword == $scope.ChangePasswordData.oldPassword) {
        $scope.ChangePasswordData.newPassword = '';
        $scope.ChangePasswordData.confirmPassword = '';
        $cordovaDialogs.alert('New Password should be different from Current Password.', 'Error', 'Ok');
        return false;
      }
      var data =
      {
        app_code: CONSTANTS.WRPCODE,
        usersUniqueID: $scope.userData.usersUniqueID,
        oldPassword: $scope.ChangePasswordData.oldPassword,
        newPassword: $scope.ChangePasswordData.newPassword
      };

      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });
      $scope.data = $base64.encode(angular.toJson(data));

      serverAPICall.postRequest(CONSTANTS.CHANGEPASSWORD, $scope.data)
        .then(function (result) {
          $ionicLoading.hide();

          var responseStatus = result.status;
          var responseMessage = result.message;
          if (responseStatus == 'Success') {
            var responseData = result.response_data;
            var alertPopup = $ionicPopup.alert({
              title: ' <i class="icon ion-checkmark placeholder-icon"></i>',
              template: 'Password changed successfully.',
              buttons: [
                {
                  text: '<b>OK</b>',
                  type: 'button-green',
                }]
            });

            alertPopup.then(function (res) {

            });
            $location.path("/my-profile");
          }
          else if (responseMessage == 'Old password is not correct') {
            $scope.ChangePasswordData.oldPassword = '';
            var alertPopup = $ionicPopup.alert({
              title: ' <i class="icon ion-android-lock placeholder-icon"></i>',
              template: 'Current password is incorrect.',
              buttons: [
                {
                  text: '<b>OK</b>',
                  type: 'button-green',
                }]
            });

            alertPopup.then(function (res) {

            });

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

  });
})