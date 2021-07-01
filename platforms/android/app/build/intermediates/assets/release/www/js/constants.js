  // Developer : Nitisha Sharma
  // Skype Id  : nsharma111
  // File Name : constants.js
  // Purpose   : 

var cons=angular.module('starter.constants', [])
// var APIURL = "http://wrpprod.jsldom.com:8181/api/"; // dev url
var APIURL = "https://data.wrp-services.com/api/"; // prod url

cons.value('CONSTANTS', {
       SPINNER:'<ion-spinner icon="lines" class="spinner-balanced"></ion-spinner>',
       ISDEVICE:'',
       WRPCODE:'8euhsfw87flwh9f7327',
       USERLOGIN:APIURL+'login/',
       FORGOTPASSWORD:APIURL+'forgotpassword/',
       CHANGEPASSWORD:APIURL+'changepassword/',
       UPDATEPROFILEPIC:APIURL+'updateprofilepic/',
       GETALLMAGAZINES:APIURL+'getallmags/',
       GETALLBOOKS:APIURL+'getallbooks/',
       GETASSETS:APIURL+'getassets/',
       PRINTCONSOLELOGS : 0
})