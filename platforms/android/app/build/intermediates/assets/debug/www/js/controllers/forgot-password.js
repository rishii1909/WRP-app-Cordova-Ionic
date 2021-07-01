// 
//   Developer : Nitisha Sharma
//   Skype Id  : nsharma111
//   File Name : forgot-password.html
//   Purpose   : For updating the password in case user forgets.
//  

/*-------------------- FORGOT PASSWORD CONTROLLER STARTS*--------------*/

app.controller('ForgotPasswordCtrl', function ($scope, serverAPICall, $base64, CONSTANTS, $http, $location, userService, $ionicLoading, $ionicHistory, $cordovaDialogs, $rootScope, checkNetConn, $ionicPopup) {

  ionic.Platform.ready(function () {
    $scope.back = function () {
      $ionicHistory.goBack();
    };

    var screen_ht = $(window).height();
    var clientHeight = 170;
    var green_band_ht = screen_ht * 0.5;
    var extra_space = green_band_ht - clientHeight;
    var extra_space_top = extra_space / 2;
    $(".inner-green-band").css("padding-top", extra_space_top + "px");
    $(".inner-green-band").css("padding-bottom", extra_space_top + "px");

    $scope.ForgotPasswordData = [];
    $scope.forgotBtn = true;
    $scope.successMsg = false;

    $scope.$watch(function () { checkNetConn.checkConn(); return checkNetConn.getConn(); }, function (value) {
      if (value == 'none') {
        $scope.conStatus = value;
      } else {
        $scope.conStatus = value;
      }
    });

    var netCon = checkNetConn.checkConn();
    $scope.conStatus = checkNetConn.getConn();

    $scope.forgot_password = function () {

      if ($scope.ForgotPasswordData.emailID == "") {
        $cordovaDialogs.alert('Mention proper email address.', 'Error', 'Ok');
        return false;
      }

      var data = { app_code: CONSTANTS.WRPCODE, user_email: $scope.ForgotPasswordData.emailID };

      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });
      $scope.data = $base64.encode(angular.toJson(data));

      serverAPICall.postRequest(CONSTANTS.FORGOTPASSWORD, $scope.data)
        .then(function (result) {
          $ionicLoading.hide();

          var responseStatus = result.status;
          var responseMessage = result.message;

          if (responseStatus == 'Success') {
            var responseData = result.response_data;
            $scope.forgotBtn = false;
            $scope.successMsg = true;

          }
          else if (responseMessage == 'Email address not found') {

            var alertPopup = $ionicPopup.alert({
              title: ' <i class="icon ion-email placeholder-icon"></i>',
              template: 'Enter correct email address.',
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

/*-------------------- FORGOT PASSWORD CONTROLLER ENDS*---------------- */