app.controller('LoginCtrl', function ($scope, $ionicPlatform, serverAPICall, $base64, CONSTANTS, $http, $location, userService, $ionicLoading, $ionicHistory, $cordovaDialogs, $rootScope, $cordovaSQLite, manageRecords, checkNetConn, $ionicPopup, $cordovaDevice) {
  ionic.Platform.ready(function () {
    var screen_ht = $(window).height();
    var screen_wd = $(window).width();
    var clientHeight = 230;
    var green_band_ht = screen_ht * 0.5;
    var extra_space = green_band_ht - clientHeight;
    var extra_space_top = extra_space / 2;
    $(".inner-green-band").css("padding-top", extra_space_top + "px");
    $(".inner-green-band").css("padding-bottom", extra_space_top + "px");

    $scope.$watch(function () { checkNetConn.checkConn(); return checkNetConn.getConn(); }, function (value) {
      if (value == 'none') {
        $scope.conStatus = value;
      } else {
        $scope.conStatus = value;
      }
    });

    $scope.inputType = 'password';
    $scope.eyeImg = 'icon ion-eye';
    $scope.userData = [];

    $scope.loginData = [];

    var netCon = checkNetConn.checkConn();


    $scope.userData = angular.fromJson(userService.getUserData());

    $scope.conStatus = checkNetConn.getConn();

    if ($scope.userData == null || $scope.userData == "undefined" || $scope.userData.usersUniqueID == "" || $scope.userData.usersUniqueID == "undefined" || $scope.userData.usersUniqueID == null) {
      $location.path("/login");
    }
    else {
      $location.path("/tab/dash");
    }

    // Hide & show password function

    $scope.hideShowPassword = function () {
      if ($scope.inputType == 'password') {
        $scope.eyeImg = 'icon ion-eye-disabled';
        $scope.inputType = 'text';
      }
      else {
        $scope.eyeImg = 'icon ion-eye';
        $scope.inputType = 'password';
      }
    };


    $scope.login = function () {

      if (!$scope.loginData.emailID != "" || !$scope.loginData.password != "") {
        $cordovaDialogs.alert('Enter the required fields.', 'Error', 'Ok');
        return false;
      }

      let deviceData = {
        device_id: $cordovaDevice.getUUID(),
        device_name: $cordovaDevice.getName(),
        device_manufacturer: $cordovaDevice.getManufacturer(),
        device_model: $cordovaDevice.getModel(),
        device: $cordovaDevice.getDevice(),
        device_version: $cordovaDevice.getVersion(),
        device_platform: $cordovaDevice.getPlatform()
      }

      var data = { app_code: CONSTANTS.WRPCODE, user_email: $scope.loginData.emailID, user_password: $scope.loginData.password, 
        device_id: `${deviceData.device_id}|${deviceData.device_manufacturer}|${deviceData.device_model}|${deviceData.device_platform}|${deviceData.device_version}` };

      $ionicLoading.show({
        template: CONSTANTS.SPINNER
      });
      $scope.data = $base64.encode(angular.toJson(data));
      serverAPICall.postRequest(CONSTANTS.USERLOGIN, $scope.data)
        .then(function (result) {
          $ionicLoading.hide();
          var responseStatus = result.status;
          var responseMessage = result.message;

          if (responseStatus == 'Success') {
            $ionicHistory.clearCache().then(function () {
              $ionicHistory.clearHistory();
            });
            var responseData = result.response_data;
            userService.setUserData(angular.toJson(responseData));
            $scope.userData = [];
            $scope.userData = angular.fromJson(userService.getUserData());

            var usersUniqueID = $scope.userData.usersUniqueID;
            var firstname = $scope.userData.firstname;
            var lastName = $scope.userData.lastName;
            var company = $scope.userData.company;
            var emailaddress = $scope.userData.emailaddress;
            var image_option_id = $scope.userData.image_option_id;

            //================== Check for User availability==============

            if (dbCon == 'undefined' || dbCon == '' || dbCon == null) {

              dbCon = $cordovaSQLite.openDB({ name: "wrp.db", location: "default" });
            }
            var user_query = "SELECT usersUniqueID FROM users WHERE usersUniqueID = ?";
            $cordovaSQLite.execute(dbCon, user_query, [$scope.userData.usersUniqueID]).then(function (res) {
              if (res.rows.length > 0) {
                var query = "UPDATE users SET firstname = ?, lastName = ?, company = ?, emailaddress = ?, image_option_id = ?, isLogged = ? WHERE  usersUniqueID = ?";
                $cordovaSQLite.execute(dbCon, query, [firstname, lastName, company, emailaddress, image_option_id, 'true', usersUniqueID])
                  .then(function (res) {
                  }, function (err) {
                  });

              }
              else {
                //================== Insert User in table UPDATE userAssets SET downloadStatus = 'true', downloadPath = ? WHERE asset_id = ?

                var query = "INSERT INTO users (usersUniqueID, firstname, lastName, company, emailaddress, image_option_id, isLogged) VALUES (?,?,?,?,?,?,?)";
                $cordovaSQLite.execute(dbCon, query, [usersUniqueID, firstname, lastName, company, emailaddress, image_option_id, 'true'])
                  .then(function (res) {

                  }, function (err) {
                  });
                //================== Insert User in table ends 
              }


            }, function (err) {
            });
            $ionicLoading.hide();
            $location.path("/tab/dash");
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
          else if (responseMessage == 'Password incorrect or account locked') {
            var alertPopup = $ionicPopup.alert({
              title: ' <i class="icon ion-android-lock placeholder-icon"></i>',
              template: 'Password is incorrect.',
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
});