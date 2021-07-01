// Developer : Nitisha Sharma
// Skype Id  : nsharma111
// File Name : services.js

var myApp = angular.module('starter.services', [])
  /* ---- Service call factory to request server to respond on web services---------- */
  .factory('serverAPICall', function ($http, $base64, CONSTANTS) {
    var postService = {
      postRequest: function (url, reqData) {
        // API CALL FROM Device
        if (CONSTANTS.ISDEVICE) {
          var responseHttp = $http.post(url, {
            'data': reqData
          }, {
              'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Origin,X-Requested-With, Content-Type, Connection,Authentication',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT,OPTIONS',
                'Accept': '*',
                'Content-type': 'application/Json',
                'Origin': '*'
              }
            }).then(function (response) {

              return angular.fromJson($base64.decode(response.data));
            }, function (err) {
              return false;
            });
        } else {
          var data = reqData;
          var responseHttp = $http.post(url, {
            data: reqData
          }, {
              'headers': {
                'Content-type': 'application/x-www-form-urlencoded'
              }
            }).then(function (res) {
              var decoded = $base64.decode(res.data);
              return angular.fromJson(decoded);
            }, function (err) {
              return false;
            })
        };
        return responseHttp;
      }
    };
    return postService;
  })

  //       /* ---- Service call factory to request server to respond on web services end---------- */


  .factory('userService', function ($http, $rootScope, $filter) {
    var returnService = {
      setUserData: function (userPost) {
        localStorage.setItem("userData", userPost);
      },
      getUserData: function () {
        var retreiveuserinfo = JSON.parse(localStorage.getItem("userData"));
        return retreiveuserinfo;
      },
    };
    return returnService;
  })

  //----------------- Service for storing api run time START-----------------

  .factory('setUpdateTime', function ($http, $rootScope) {
    var returnValue = {
      setTime: function (timeVal) {
        localStorage.setItem("assetUpdateTime", timeVal);
      },
      getTime: function () {
        var resValue = JSON.parse(localStorage.getItem("assetUpdateTime"));
        return resValue;
      },
    };
    return returnValue;
  })
  //----------------- Service for storing api run time START-----------------

  //----------------- Service for checking internet connection START-----------------

  .factory('checkNetConn', function ($http, $rootScope) {

    var returnConn = {
      checkConn: function () {
        var conStatus = navigator.connection.type;
        localStorage.setItem("netStatus", conStatus);
      },
      getConn: function () {
        var returnConn = localStorage.getItem("netStatus");
        return returnConn;
      },
    };
    return returnConn;

  })
  //----------------- Service for checking internet connection END-----------------

  //---------------------------- INSERT QUERY FOR MAGAZINE DATA STARTS  
  .factory('manageRecords', ['$http', '$base64', '$rootScope', '$cordovaSQLite', 'CONSTANTS', 'serverAPICall', 'userService', 'setUpdateTime', function ($http, $base64, $rootScope, $cordovaSQLite, CONSTANTS, serverAPICall, userService, setUpdateTime) {

    var magazineData_insert = [];
    var magazine_data_len;

    var magazineList_insert = [];
    var magazineList_len;

    var bookList_insert = [];
    var bookList_len;

    var url = CONSTANTS.GETASSETS;
    var list_url = CONSTANTS.GETALLMAGAZINES;
    var book_list_url = CONSTANTS.GETALLBOOKS;

    return {
      setAssets: function (usersUniqueID) {


        //--------------- START OF INSERTING MAGAZINE DATA $rootScope.limitTill = 40
        var data = {
          app_code: CONSTANTS.WRPCODE,
          usersUniqueID: usersUniqueID,
          utc_timestamp: '',
          sub_type: 'magazine',
          filter_option_id: '0',
          sort_by: 'publication_year'
        };

        var reqdata = $base64.encode(angular.toJson(data));
        return $http.post(url, {
          data: reqdata
        }, {
            'headers': {
              'Content-type': 'application/x-www-form-urlencoded'
            }
          })
          .then(function (res) {
            var decoded = $base64.decode(res.data);
            var result = angular.fromJson(decoded);

            var responseStatus = result.status;
            var responseMessage = result.message;

            localStorage.setItem("total_records_magazines", result.total_records);
            if (responseStatus == 'Success') {

              var responseData = result.response_data;
              var magazineData_insert = responseData;
              var magazine_data_len = magazineData_insert.length;
              var timeVal = Date.now();
              localStorage.setItem("assetUpdateTime", timeVal);

              // INSERT ALL THE DATA IN THE TABLE MAGAZINES ----- START

              var title, isPurchased, metadata, price, productCode, shopifyURL, year, unit, urlImageThumbSmall, urlImageThumb, urlZipFile, urlToContent, latestUp, sku, urlImageFull, downloadStatus, downloadPath, version, coverPath;

              //creating the insert query
              var query = "INSERT INTO magazines (title, isPurchased, metadata, price, productCode, shopifyURL, year, unit, urlImageThumbSmall, urlImageThumb, urlZipFile, urlToContent, latestUp, sku, urlImageFull, downloadStatus, downloadPath, version, coverPath) VALUES ";

              var query_array = [];
              var magazineData_res = [];
              for (var i = 0; i < magazine_data_len; i++) {
                var title = magazineData_insert[i].title;
                var isPurchased = magazineData_insert[i].isPurchased;
                var metadata = magazineData_insert[i].metadata;
                var price = magazineData_insert[i].price;
                var productCode = magazineData_insert[i].productCode;
                var shopifyURL = magazineData_insert[i].shopifyURL;
                var year = magazineData_insert[i].year;
                var unit = magazineData_insert[i].unit;
                var urlImageThumbSmall = magazineData_insert[i].urlImageThumbSmall;
                var urlImageThumb = magazineData_insert[i].urlImageThumb;
                var urlZipFile = magazineData_insert[i].urlZipFile;
                var urlToContent = magazineData_insert[i].urlToContent;
                var sku = magazineData_insert[i].sku;
                var latestUp = magazineData_insert[i].sku;
                var urlImageFull = magazineData_insert[i].urlImageFull;
                var downloadStatus = 'false';
                var downloadPath = '';
                var coverPath = '';
                var version = magazineData_insert[i].version;


                var latestUp = latestUp.slice(-6);

                var sql = "('" + title + "', '" + isPurchased + "', '" + metadata + "', '" + price + "', '" + productCode + "', '" + shopifyURL + "', '" + year + "', '" + unit + "', '" + urlImageThumbSmall + "', '" + urlImageThumb + "', '" + urlZipFile + "', '" + urlToContent + "', '" + latestUp + "', '" + sku + "', '" + urlImageFull + "', '" + downloadStatus + "','" + downloadPath + "','" + version + "','" + coverPath + "')";

                query_array.push(sql);


              }
              //creating the query for the exectution starts here
              query += query_array.join(',');

              $cordovaSQLite.execute(dbCon, 'SELECT productCode from magazines')
                .then(function (res) {
                  if (res.rows.length == 0) {
                    $cordovaSQLite.execute(dbCon, query)
                      .then(function (res) {

                        // INSERT ALL THE DATA IN THE TABLE MAGAZINES ----- END
                      }, function (err) {

                      });
                  }
                });
              return magazine_data_len;
            }
          })

        //--------------- END OF INSERTING MAGAZINE DATA


      },

      setAssetsList: function (usersUniqueID) {
        var list_data = {
          app_code: CONSTANTS.WRPCODE,
        };

        var req2data = $base64.encode(angular.toJson(list_data));
        return $http.post(list_url, {
          data: req2data
        }, {
            'headers': {
              'Content-type': 'application/x-www-form-urlencoded'
            }
          })
          .then(function (res) {
            var decoded = $base64.decode(res.data);
            var result = angular.fromJson(decoded);

            var responseStatus = result.status;
            var responseMessage = result.message;
            if (responseStatus == 'Success') {

              var responseData = result.response_data;
              var magazineList_insert = responseData;
              var magazineList_len = magazineList_insert.length;




              // INSERT ALL THE DATA IN THE TABLE MAGAZINES ----- START

              var sku, price, title, metadata, productCode, unit, urlImageThumbSmall, urlImageThumb, shopifyURL, version;

              //creating the insert query
              var list_query = "INSERT INTO magazineList (sku, price, title, metadata, productCode, unit, urlImageThumbSmall, urlImageThumb, shopifyURL, version) VALUES ";

              var list_query_array = [];
              for (var j = 0; j < magazineList_len; j++) {

                var sku = magazineList_insert[j].sku;
                var price = magazineList_insert[j].price;
                var title = magazineList_insert[j].title;
                var metadata = magazineList_insert[j].metadata;
                var productCode = magazineList_insert[j].productCode;
                var unit = magazineList_insert[j].unit;
                var urlImageThumbSmall = magazineList_insert[j].urlImageThumbSmall;
                var urlImageThumb = magazineList_insert[j].urlImageThumb;
                var shopifyURL = magazineList_insert[j].shopifyURL;
                var version = magazineList_insert[j].version;

                var list_sql = "('" + sku + "', '" + price + "', '" + title + "', '" + metadata + "', '" + productCode + "', '" + unit + "', '" + urlImageThumbSmall + "', '" + urlImageThumb + "', '" + shopifyURL + "', '" + version + "')";

                list_query_array.push(list_sql);


              }
              //creating the query for the exectution starts here
              list_query += list_query_array.join(',');
              $cordovaSQLite.execute(dbCon, list_query)
                .then(function (res) {

                  // INSERT ALL THE DATA IN THE TABLE MAGAZINES ----- END
                })
              return magazineList_len;
            }
          })
      },

      //========================== INSERT INTO BOOKS ===========================


      setBookList: function (usersUniqueID) {
        var list_data = {
          app_code: CONSTANTS.WRPCODE,
        };

        var req3data = $base64.encode(angular.toJson(list_data));
        return $http.post(book_list_url, {
          data: req3data
        }, {
            'headers': {
              'Content-type': 'application/x-www-form-urlencoded'
            }
          })
          .then(function (res) {
            var decoded = $base64.decode(res.data);
            var result = angular.fromJson(decoded);

            var responseStatus = result.status;
            var responseMessage = result.message;
            if (responseStatus == 'Success') {

              var responseData = result.response_data;
              var bookList_insert = responseData;
              var bookList_len = bookList_insert.length;


              // INSERT ALL THE DATA IN THE TABLE MAGAZINES ----- START

              var sku, price, title, metadata, productCode, year, unit, urlImageThumbSmall, urlImageThumb, shopifyURL, version;

              //creating the insert query
              var book_list_query = "INSERT INTO bookList (sku, price, title, metadata, productCode, year, unit, urlImageThumbSmall, urlImageThumb, shopifyURL, version) VALUES ";

              var book_list_query_array = [];
              for (var j = 0; j < bookList_len; j++) {

                var sku = bookList_insert[j].sku;
                var price = bookList_insert[j].price;
                var title = bookList_insert[j].title;
                var title = title.replace("'", "''");
                var metadata = bookList_insert[j].metadata;
                var productCode = bookList_insert[j].productCode;
                var year = bookList_insert[j].year;
                var unit = bookList_insert[j].unit;
                var urlImageThumbSmall = bookList_insert[j].urlImageThumbSmall;
                var urlImageThumb = bookList_insert[j].urlImageThumb;
                var shopifyURL = bookList_insert[j].shopifyURL;
                var version = bookList_insert[j].version;

                var book_list_sql = "('" + sku + "', '" + price + "', '" + title + "','" + metadata + "','" + productCode + "','" + year + "','" + unit + "', '" + urlImageThumbSmall + "', '" + urlImageThumb + "','" + shopifyURL + "', '" + version + "')";

                book_list_query_array.push(book_list_sql);


              }
              //creating the query for the exectution starts here
              book_list_query += book_list_query_array.join(',');
              $cordovaSQLite.execute(dbCon, book_list_query)
                .then(function (res) {

                  // INSERT ALL THE DATA IN THE TABLE MAGAZINES ----- END
                }, function (err) {

                })
              return bookList_len;
            }
          })
      },

      //========================== INSERT INTO BOOKS ===========================
      setAssetsBooks: function (usersUniqueID) {


        //--------------- START OF INSERTING MAGAZINE DATA $rootScope.limitTill = 40
        var data_book = {
          app_code: CONSTANTS.WRPCODE,
          usersUniqueID: usersUniqueID,
          utc_timestamp: '',
          sub_type: 'book',
          filter_option_id: '0',
          sort_by: 'publication_year'
        };

        var reqdata_book = $base64.encode(angular.toJson(data_book));
        return $http.post(url, {
          data: reqdata_book
        }, {
            'headers': {
              'Content-type': 'application/x-www-form-urlencoded'
            }
          })
          .then(function (res) {

            var decoded_book = $base64.decode(res.data);
            var result_book = angular.fromJson(decoded_book);

            var responseStatusB = result_book.status;
            var responseMessageB = result_book.message;

            localStorage.setItem("total_records_books", result_book.total_records);
            if (responseStatusB == 'Success') {

              var responseDataB = result_book.response_data;
              var bookData_insert = responseDataB;
              var book_data_len = bookData_insert.length;
              var timeValBook = Date.now();

              localStorage.setItem("bookUpdateTime", timeValBook);

              // INSERT ALL THE DATA IN THE TABLE MAGAZINES ----- START

              var title, isPurchased, metadata, price, productCode, shopifyURL, year, unit, urlImageThumbSmall, urlImageThumb, urlZipFile, urlToContent, latestUp, sku, urlImageFull, downloadStatus, downloadPath, version, coverPath;

              //creating the insert query
              var book_query = "INSERT INTO books (title, isPurchased, metadata, price, productCode, shopifyURL, year, unit, urlImageThumbSmall, urlImageThumb, urlZipFile, urlToContent, latestUp, sku, urlImageFull, downloadStatus, downloadPath, version, coverPath) VALUES ";

              var query_array_book = [];
              var bookData_res = [];
              for (var i = 0; i < book_data_len; i++) {
                var title = bookData_insert[i].title;
                var title = title.replace("'", "''");
                var isPurchased = bookData_insert[i].isPurchased;
                var metadata = bookData_insert[i].metadata;
                var price = bookData_insert[i].price;
                var productCode = bookData_insert[i].productCode;
                var shopifyURL = bookData_insert[i].shopifyURL;
                var year = bookData_insert[i].year;
                var unit = bookData_insert[i].unit;
                var urlImageThumbSmall = bookData_insert[i].urlImageThumbSmall;
                var urlImageThumb = bookData_insert[i].urlImageThumb;
                var urlZipFile = bookData_insert[i].urlZipFile;
                var urlToContent = bookData_insert[i].urlToContent;
                var sku = bookData_insert[i].sku;
                var latestUp = bookData_insert[i].sku;
                var urlImageFull = bookData_insert[i].urlImageFull;
                var downloadStatus = 'false';
                var downloadPath = '';
                var coverPath = '';
                var version = bookData_insert[i].version;


                var latestUp = latestUp.slice(-6);

                var book_sql = "('" + title + "', '" + isPurchased + "', '" + metadata + "', '" + price + "', '" + productCode + "', '" + shopifyURL + "', '" + year + "', '" + unit + "', '" + urlImageThumbSmall + "', '" + urlImageThumb + "', '" + urlZipFile + "', '" + urlToContent + "', '" + latestUp + "', '" + sku + "', '" + urlImageFull + "', '" + downloadStatus + "','" + downloadPath + "','" + version + "','" + coverPath + "')";

                query_array_book.push(book_sql);

              }
              //creating the query for the exectution starts here
              book_query += query_array_book.join(',');

              $cordovaSQLite.execute(dbCon, 'SELECT productCode from books')
                .then(function (res) {
                  if (res.rows.length == 0) {
                    $cordovaSQLite.execute(dbCon, book_query)
                      .then(function (res_book) {

                        // INSERT ALL THE DATA IN THE TABLE MAGAZINES ----- END
                      }, function (error) {

                      });
                  }
                });
              return book_data_len;
            }
          })

        //--------------- END OF INSERTING MAGAZINE DATA

      },

      getMagazinesData: function (usersUniqueID) {
        var data = {
          app_code: CONSTANTS.WRPCODE,
          usersUniqueID: usersUniqueID,
          utc_timestamp: '',
          sub_type: 'magazine',
          filter_option_id: '0',
          sort_by: 'publication_year'
        };

        var reqdata = $base64.encode(angular.toJson(data));
        return $http.post(url, {
          data: reqdata
        }, {
            'headers': {
              'Content-type': 'application/x-www-form-urlencoded'
            }
          })
          .then(function (res) {
            var decoded = $base64.decode(res.data);
            var result = angular.fromJson(decoded);

            var responseStatus = result.status;

            if (responseStatus == 'Success') {
              return result.response_data;
            } else {
              return [];
            }
          }, function (error) {
            return [];
          });
      },

      getBooksData: function (usersUniqueID) {
        var data_book = {
          app_code: CONSTANTS.WRPCODE,
          usersUniqueID: usersUniqueID,
          utc_timestamp: '',
          sub_type: 'book',
          filter_option_id: '0',
          sort_by: 'publication_year'
        };

        var reqdata_book = $base64.encode(angular.toJson(data_book));
        return $http.post(url, {
          data: reqdata_book
        }, {
            'headers': {
              'Content-type': 'application/x-www-form-urlencoded'
            }
          })
          .then(function (res) {

            var decoded_book = $base64.decode(res.data);
            var result_book = angular.fromJson(decoded_book);

            var responseStatusB = result_book.status;
            if (responseStatusB == 'Success') {
              return result_book.response_data;
            }
          }, function (error) {

          });
      }
    }
  }])
  //---------------------------- INSERT QUERY FOR MAGAZINE DATA ENDS  

  //---------------------------- SELECT QUERY FOR MAGAZINE DATA STARTS  

  .factory('selectRecords', ['$http', '$base64', '$rootScope', '$cordovaSQLite', 'CONSTANTS', 'serverAPICall', 'userService', 'setUpdateTime', function ($http, $base64, $rootScope, $cordovaSQLite, CONSTANTS, serverAPICall, userService, setUpdateTime) {



    return {

      getAssetsList: function () {
        var magazineDataList = [];
        var query = "SELECT id, sku, price, title, metadata, productCode, unit, urlImageThumbSmall, urlImageThumb, shopifyURL, version FROM magazineList ORDER BY title ASC";
        return $cordovaSQLite.execute(dbCon, query, []).then(function (Queryres) {


          if (Queryres.rows.length > 0) {
            for (var i = 0; i < Queryres.rows.length; i++) {
              magazineDataList.push(Queryres.rows.item(i));
            }

            return magazineDataList;
          } else {
            return magazineDataList;

          }


        }, function (err) {
          return false;
        });



      },
      getBookList: function () {
        var bookList = [];
        var book_query = "SELECT id, sku, price, title, metadata, productCode,year, unit, urlImageThumbSmall, urlImageThumb, shopifyURL, version FROM bookList ORDER BY title ASC";
        return $cordovaSQLite.execute(dbCon, book_query, []).then(function (BookQuery) {
          if (BookQuery.rows.length > 0) {
            for (var i = 0; i < BookQuery.rows.length; i++) {
              bookList.push(BookQuery.rows.item(i));
            }

            return bookList;
          } else {
            return bookList;

          }

        }, function (err) {
          return false;
        });



      }
    }
  }])

  //---------------------------- SELECT QUERY FOR MAGAZINE DATA ENDS  




  //---------------------------- FOR CONCATENATION DASHBOARD SELECT QUERY FOR MAGAZINE DATA STARTS  

  .factory('selectCommonRecords', ['$http', '$base64', '$rootScope', '$cordovaSQLite', 'CONSTANTS', 'serverAPICall', 'userService', 'setUpdateTime', '$state', function ($http, $base64, $rootScope, $cordovaSQLite, CONSTANTS, serverAPICall, userService, setUpdateTime, $state) {



    return {
      getAllMagazines: function (usersUniqueID, offsetVal, limitTill) {
        var offsetVal = offsetVal;
        var limitTill = limitTill;
        var magazineAllData = [];

        var query = "SELECT m.magazine_id, m.title, m.isPurchased, m.metadata, m.latestUp, m.sku, m.urlImageThumbSmall, m.urlImageThumb, m.price, m.urlToContent, m.shopifyURL, m.year, m.version, m.urlZipFile, a.asset_id, a.usersUniqueID, a.coverPath, CASE WHEN a.asset_id = m.magazine_id THEN a.downloadStatus ELSE m.downloadStatus END AS 'downloadStatus', CASE WHEN a.asset_id = m.magazine_id THEN a.downloadPath ELSE m.downloadPath END AS 'downloadPath' FROM magazines m LEFT JOIN userAssets a on a.asset_id = m.magazine_id AND a.subtype = 'magazine' AND a.usersUniqueID = ? ORDER BY downloadStatus DESC, m.isPurchased DESC, m.latestUp DESC LIMIT ? OFFSET ?";
        return $cordovaSQLite.execute(dbCon, query, [usersUniqueID, limitTill, offsetVal]).then(function (Queryres) {
          if (Queryres.rows.length > 0) {

            for (var i = 0; i < Queryres.rows.length; i++) {
              magazineAllData.push(Queryres.rows.item(i));
            }

            return magazineAllData;
          } else {
            return magazineAllData;

          }



        }, function (err) {
          return false;
        });
      },
      
      getMyIssuesCount: function(usersUniqueID) {
        var issuesCount = 0;
        var magazineAllData = [];

        var query = "SELECT COUNT(*) as myIssuesCount FROM magazines WHERE isPurchased = ?";
        return $cordovaSQLite.execute(dbCon, query, ['true']).then(function (Queryres) {
          if (Queryres.rows.length > 0) {
            for (var i = 0; i < Queryres.rows.length; i++) {
              issuesCount = (Queryres.rows.item(i)).myIssuesCount;
            }
          }

          return issuesCount;

        }, function (err) {
          return issuesCount;
        });
      }
    }
  }])

  //---------------------------- FOR CONCATENATION DASHBOARD SELECT QUERY FOR MAGAZINE DATA  ENDS  



  //---------------------------- FOR CONCATENATION DASHBOARD SELECT QUERY FOR BOOK DATA STARTS  

  .factory('selectCommonRecordsBook', ['$http', '$base64', '$rootScope', '$cordovaSQLite', 'CONSTANTS', 'serverAPICall', 'userService', function ($http, $base64, $rootScope, $cordovaSQLite, CONSTANTS, serverAPICall, userService) {



    return {
      getAllBooks: function (usersUniqueID, offsetValBook, limitTillBook) {
        var offsetValBook = offsetValBook;
        var limitTillBook = limitTillBook;
        var bookAllData = [];

        var query = "SELECT b.book_id, b.title, b.isPurchased, b.metadata, b.latestUp, b.sku, b.urlImageThumbSmall, b.urlImageThumb, b.price, b.urlToContent, b.shopifyURL, b.year, b.version, b.urlZipFile, a.asset_id, a.usersUniqueID, a.coverPath, CASE WHEN a.asset_id = b.book_id THEN a.downloadStatus ELSE b.downloadStatus END AS 'downloadStatus', CASE WHEN a.asset_id = b.book_id THEN a.downloadPath ELSE b.downloadPath END AS 'downloadPath' FROM books b LEFT JOIN userAssets a on a.asset_id = b.book_id AND a.subtype = 'book' AND a.usersUniqueID = ? ORDER BY downloadStatus DESC, b.isPurchased DESC LIMIT ? OFFSET ?";

        return $cordovaSQLite.execute(dbCon, query, [usersUniqueID, limitTillBook, offsetValBook]).then(function (Queryres) {

          if (Queryres.rows.length > 0) {

            for (var i = 0; i < Queryres.rows.length; i++) {
              bookAllData.push(Queryres.rows.item(i));
            }

            return bookAllData;
          } else {
            return bookAllData;
          }



        }, function (err) {
          return false;
        });
      },

      getMyIssuesCount: function(usersUniqueID) {
        var issuesCount = 0;
        var magazineAllData = [];

        var query = "SELECT COUNT(*) as myIssuesCount FROM books WHERE isPurchased = ?";
        return $cordovaSQLite.execute(dbCon, query, ['true']).then(function (Queryres) {
          if (Queryres.rows.length > 0) {
            for (var i = 0; i < Queryres.rows.length; i++) {
              issuesCount = (Queryres.rows.item(i)).myIssuesCount;
            }
          }
          
          return issuesCount;

        }, function (err) {
          return issuesCount;
        });
      }
    }
  }])

  //---------------------------- FOR CONCATENATION DASHBOARD SELECT QUERY FOR BOOK DATA  ENDS  



  //---------------------------- CHECK FOR  MAGAZINE DATA IN MAGAZINES AND MAGAZINE LIST STARTS  

  .factory('checkRecords', ['$http', '$base64', '$rootScope', '$cordovaSQLite', 'CONSTANTS', 'serverAPICall', 'userService', 'setUpdateTime', function ($http, $base64, $rootScope, $cordovaSQLite, CONSTANTS, serverAPICall, userService, setUpdateTime) {
    var magazineDataCheck = [];
    var magazineDataListCheck = [];
    var bookData = '';

    return {
      checkAssets: function (usersUniqueID) {
        var query = "SELECT title, isPurchased, metadata, price, productCode, shopifyURL, year, unit, urlImageThumbSmall, urlImageThumb, urlZipFile, urlToContent, latestUp, sku, magazine_id, urlImageFull, downloadStatus, downloadPath, version FROM magazines ORDER BY latestUp DESC";
        return $cordovaSQLite.execute(dbCon, query, []).then(function (Queryres) {

          magazineDataCheck = Queryres.rows.length;
          if (Queryres.rows.length > 0) {

            return magazineDataCheck;
          } else {
            return magazineDataCheck;

          }



        }, function (err) {
          return false;
        });



      },
      checkAssetsList: function () {
        var query = "SELECT id, sku, price, title, metadata, productCode, unit, urlImageThumbSmall, urlImageThumb, shopifyURL, version FROM magazineList ORDER BY title ASC";
        return $cordovaSQLite.execute(dbCon, query, []).then(function (Queryres) {

          magazineDataList = Queryres.rows.length;
          if (Queryres.rows.length > 0) {
            return magazineDataList;
          } else {
            return magazineDataList;

          }


        }, function (err) {
          return false;
        });



      },
      checkBookData: function () {
        var book_query = "SELECT book_id, sku, title FROM books ORDER BY title ASC";
        return $cordovaSQLite.execute(dbCon, book_query, []).then(function (Queryrescheck) {

          magazineDataList = Queryrescheck.rows.length;
          if (Queryrescheck.rows.length > 0) {
            var bookData = 'true';
            return bookData;
          } else {
            var bookData = 'false';
            return bookData;

          }


        }, function (err) {
          return false;
        });

      }
    }
  }])

  //---------------------------- CHECK FOR  MAGAZINE DATA IN MAGAZINES AND MAGAZINE LIST ENDS  

  //---------------------------- DELETE  MAGAZINE DATA IN MAGAZINES AND MAGAZINE LIST STARTS  

  .factory('deleteRecords', ['$http', '$base64', '$rootScope', '$cordovaSQLite', 'CONSTANTS', 'serverAPICall', 'userService', 'setUpdateTime', function ($http, $base64, $rootScope, $cordovaSQLite, CONSTANTS, serverAPICall, userService, setUpdateTime) {
    var magazineDataDel;
    var magazineDataListDel;
    var bookDataDel;
    var bookDataListDel;

    return {
      delAssets: function (usersUniqueID) {
        var query = "DELETE FROM magazines";
        return $cordovaSQLite.execute(dbCon, query, []).then(function (Queryres) {
          magazineDataDel = 'Success';
          return magazineDataDel;
        }, function (err) {
          magazineDataDel = 'Failed';
          return magazineDataDel;
        });


      },
      delAssetsList: function () {
        var query = "DELETE FROM magazineList";
        return $cordovaSQLite.execute(dbCon, query, []).then(function (Queryres) {
          magazineDataListDel = 'Success';
          return magazineDataListDel;
        }, function (err) {
          magazineDataListDel = 'Failed';
          return magazineDataListDel;
        });
      },
      delAssetsBook: function (usersUniqueID) {
        var del_query = "DELETE FROM books";
        return $cordovaSQLite.execute(dbCon, del_query, []).then(function (DelQueryres) {
          bookDataDel = 'Success';
          return bookDataDel;
        }, function (err) {
          bookDataDel = 'Failed';
          return bookDataDel;
        });


      },
      delAssetsBookList: function (usersUniqueID) {
        var del_query_book = "DELETE FROM bookList";
        return $cordovaSQLite.execute(dbCon, del_query_book, []).then(function (DelListQueryres) {
          bookDataListDel = 'Success';
          return bookDataListDel;
        }, function (err) {
          bookDataListDel = 'Failed';
          return bookDataListDel;
        });


      }
    }
  }])


  //---------------------------- DELETE  MAGAZINE DATA IN MAGAZINES AND MAGAZINE LIST STARTS  

  .factory('downloadAsset', ['$http', '$base64', '$rootScope', '$cordovaSQLite', 'CONSTANTS', 'serverAPICall', 'userService', 'setUpdateTime', '$cordovaFile', '$interval', '$cordovaFileTransfer', '$location', '$ionicPopup', '$state', '$cordovaToast', function ($http, $base64, $rootScope, $cordovaSQLite, CONSTANTS, serverAPICall, userService, setUpdateTime, $cordovaFile, $interval, $cordovaFileTransfer, $location, $ionicPopup, $state, $cordovaToast) {


    $rootScope.pendingDownloads = 0;
    $rootScope.errorDownloadingMag = false;
    $rootScope.errorDownloadingBook = false;

    return {
      downloadMagazine(id, srcUrl, asset_id, version, thumbnail, indexVal, forArray, usersUniqueID, subtype, title, isUpdating = false, oldData = {}) {
        if (!isUpdating) {
          $rootScope.pendingDownloads++;
          localStorage.setItem("showProgress", true);
        }

        var progressDiv = true;
        var progressval = 0;
        var stopinterval = null;
        var directoryPath = '';
        var ZipPath = '';
        var SubdirectoryPath = '';
        var ZipExtractDirectory = '';
        var coverPath = '';
        var unzipSrc = '';
        var sku = id;
        var version_no = version;
        var asset_id = asset_id;
        var srcUrl = srcUrl;
        var forArray = forArray;
        var id = id;
        var thumbnail = thumbnail;
        var indexVal = indexVal;
        var subtype = subtype;
        var assetTitle = title;

        function handleErrorInDownload(subtype) {
          // In case of error remove download data from local storage and set error variable to true
          if (subtype == 'magazine') {
            $rootScope.errorDownloadingMag = true;
            localStorage.setItem('progressDivMags', false);

            localStorage.setItem('downloadQueueMags', angular.toJson([]));
            localStorage.setItem('downloadDataMags', angular.toJson([]));

          } else {
            $rootScope.errorDownloadingBook = true;
            localStorage.setItem('progressDivBooks', false);

            localStorage.setItem('downloadQueueBooks', angular.toJson([]));
            localStorage.setItem('downloadDataBooks', angular.toJson([]));
          }
          localStorage.setItem("showProgress", false);
          $rootScope.pendingDownloads = 0;
        }

        function deleteOldEntry(usersUniqueID, subtype, assetTitle, oldData, newPath, newCoverPath) {
          var tempFolderPath = newPath
          var tempFolderPathCover = newCoverPath;

          //Update assets value in table to point to new location of files.

          var asset_query = "UPDATE userAssets SET coverPath =?, downloadPath =?, version =? WHERE usersUniqueID = ? AND downloadStatus = ? AND subtype=? AND asset_id = ?";
          $cordovaSQLite.execute(dbCon, asset_query, [tempFolderPathCover, tempFolderPath, version, usersUniqueID, true, subtype, oldData.asset_id]).then(function (Queryres) {

            if (subtype == 'magazine') {
              $rootScope.no_of_magazine_updated = 1;
              localStorage.setItem('updateProgressDivMags', false);
            } else if (subtype == 'book') {
              $rootScope.no_of_book_updated = 1;
              localStorage.setItem('updateProgressDivBooks', false);
            }

            $state.reload();

            var toastMsg = assetTitle + ' is updated successfully.';

            $cordovaToast.show(toastMsg, "short", "bottom").then(function (success) {

            }, function (error) {

            });

          }, function (error) {

          });

        }

        //========= function to download defined below starts=========================

        function fileDownload(sku, srcUrl, asset_id, version_no, thumbnail, indexVal, forArray, directoryPath, subtype) {

          var url = srcUrl;
          // File name only
          var filename = url.split("/").pop();

          // Save location
          var targetPath = directoryPath + filename;


          function downloadfiles() {
            var url = srcUrl;


            //================ FUNCTION TO DOWNLOAD COVER STARTS===========================

            function downloadCover(SubdirectoryPath) {

              if (isUpdating) {
                $cordovaFile.createDir(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (result) {
                  var coverPath = result.nativeURL;
                  var fileURL = coverPath + 'cover.jpeg';
                  var uri = thumbnail;

                  $cordovaFileTransfer.download(uri, fileURL).then(function (result) {
                    var coverPath = result.nativeURL;
                    downloadAll(SubdirectoryPath, coverPath);
                    return coverPath;

                  }, function (err) {
                    $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) { }, function (err) { });
                  })

                }, function (error) {
                  var coverPath = cordova.file.dataDirectory + 'myDownloads/' + subtype + '_' + sku + '/';
                  var fileURL = coverPath + 'cover.jpeg';
                  var uri = thumbnail;

                  $cordovaFileTransfer.download(uri, fileURL).then(function (result) {
                    var coverPath = result.nativeURL;
                    downloadAll(SubdirectoryPath, coverPath);
                    return coverPath;

                  }, function (err) {
                    $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) { }, function (err) { });
                  })
                });
              } else {
                $cordovaFile.createDir(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (result) {
                  var coverPath = result.nativeURL;
                  var fileURL = coverPath + 'cover.jpeg';
                  var uri = thumbnail;

                  $cordovaFileTransfer.download(uri, fileURL).then(function (result) {
                    var coverPath = result.nativeURL;
                    downloadAll(SubdirectoryPath, coverPath);
                    return coverPath;

                  }, function (err) {
                    if(err.message && (err.message === 'PATH_EXISTS_ERR' || err.code == 12)){
                      $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) { 
                        downloadCover(SubdirectoryPath);
                      }, function (err) { });
                    }else{
                      $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) { }, function (err) { });
                      handleErrorInDownload(subtype);
                    }
                  })

                }, function (error) {
                  $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) {
                    downloadCover(SubdirectoryPath)
                  }, function (err) { });

                });
              }
            }
            //================ FUNCTION TO DOWNLOAD COVER ENDS===========================
            // Creating a sub directory to store unzipped file START================
            function downloadAll(SubdirectoryPath, coverPath) {
              var SubdirectoryPath = SubdirectoryPath;
              var coverPath = coverPath;

              var fileTransfer = $cordovaFileTransfer.download(url, targetPath, {}, true);
              fileTransfer.then(function (result) {
                var progressTest = 0;

                var ZipPath = result.nativeURL;

                zip.unzip(ZipPath, SubdirectoryPath, function (res) {

                  var dwnStatus = "true";

                  var unzipSrc = SubdirectoryPath + 'index.html';
                  //----------------------- Insert into Userassets for downloads in database =============

                  // If magazine/book is updating
                  if (isUpdating) {
                    if (subtype == 'magazine') {
                      var assetVal = 'Magazine';

                      $rootScope.updateDataMags = angular.fromJson(localStorage.getItem('updateDataMags'));
                      $rootScope.updateQueueMags = angular.fromJson(localStorage.getItem('updateQueueMags'));

                      var index = $rootScope.updateDataMags.findIndex(function (item, i) {
                        return item.asset_id === asset_id;
                      });

                      $rootScope.updateDataMags.splice(index, 1);
                      $rootScope.updateQueueMags.splice($rootScope.updateQueueMags.indexOf(parseInt(asset_id)), 1);

                      localStorage.setItem('updateQueueMags', angular.toJson($rootScope.updateQueueMags));
                      localStorage.setItem('updateDataMags', angular.toJson($rootScope.updateDataMags));

                      localStorage.setItem('updateProgressDivMags', false);
                    } else {
                      var assetVal = 'Book';

                      $rootScope.updateDataBooks = angular.fromJson(localStorage.getItem('updateDataBooks'));
                      $rootScope.updateQueueBooks = angular.fromJson(localStorage.getItem('updateQueueBooks'));

                      var index = $rootScope.updateDataBooks.findIndex(function (item, i) {
                        return item.asset_id === asset_id;
                      });

                      $rootScope.updateDataBooks.splice(index, 1);
                      $rootScope.updateQueueBooks.splice($rootScope.updateQueueBooks.indexOf(parseInt(asset_id)), 1);

                      localStorage.setItem('updateQueueBooks', angular.toJson($rootScope.updateQueueBooks));
                      localStorage.setItem('updateDataBooks', angular.toJson($rootScope.updateDataBooks));

                      localStorage.setItem('updateProgressDivBooks', false);
                    }
                    deleteOldEntry(usersUniqueID, subtype, assetTitle, oldData, unzipSrc, coverPath);
                  }
                  else {
                    var asset_query = "INSERT INTO userAssets (usersUniqueID, asset_id, sku, version, isPurchased, downloadStatus, downloadPath, coverPath, subtype) VALUES (?,?,?,?,?,?,?,?,?)";
                    $cordovaSQLite.execute(dbCon, asset_query, [usersUniqueID, asset_id, sku, version_no, "true", dwnStatus, unzipSrc, coverPath, subtype])
                      .then(function (res) {
                        // If magazine/book is not updating or downloading.
                        $rootScope.pendingDownloads--;
                        //-------------DOWNLOADING THE THUMBNAIL FOR MAGAZINE START------------------
                        var newPath = SubdirectoryPath;
                        if (subtype == 'magazine') {
                          var assetVal = 'Magazine';

                          $rootScope.downloadDataMags = angular.fromJson(localStorage.getItem('downloadDataMags'));
                          $rootScope.downloadQueueMags = angular.fromJson(localStorage.getItem('downloadQueueMags'));

                          var index = $rootScope.downloadDataMags.findIndex(function (item, i) {
                            return item.asset_id === asset_id;
                          });

                          $rootScope.downloadDataMags.splice(index, 1);
                          $rootScope.downloadQueueMags.splice($rootScope.downloadQueueMags.indexOf(parseInt(asset_id)), 1);

                          localStorage.setItem('downloadQueueMags', angular.toJson($rootScope.downloadQueueMags));
                          localStorage.setItem('downloadDataMags', angular.toJson($rootScope.downloadDataMags));
                        } else {
                          var assetVal = 'Book';

                          $rootScope.downloadDataBooks = angular.fromJson(localStorage.getItem('downloadDataBooks'));
                          $rootScope.downloadQueueBooks = angular.fromJson(localStorage.getItem('downloadQueueBooks'));

                          var index = $rootScope.downloadDataBooks.findIndex(function (item, i) {
                            return item.asset_id === asset_id;
                          });

                          $rootScope.downloadDataBooks.splice(index, 1);
                          $rootScope.downloadQueueBooks.splice($rootScope.downloadQueueBooks.indexOf(parseInt(asset_id)), 1);

                          localStorage.setItem('downloadQueueBooks', angular.toJson($rootScope.downloadQueueBooks));
                          localStorage.setItem('downloadDataBooks', angular.toJson($rootScope.downloadDataBooks));
                        }
                        var currState = $state;
                        var currentState = $state.current.name;

                        var alertPopup = $ionicPopup.alert({
                          title: ' <i class="icon ion-checkmark placeholder-icon"></i>',
                          template: assetVal + ' - "' + assetTitle + '" is successfully downloaded.',
                          buttons: [{
                            text: '<b>OK</b>',
                            type: 'button-green',
                          }]
                        });
                        alertPopup.then(function (res) {

                        });

                        setTimeout(function () {
                          alertPopup.close();
                        }, 5000);

                        if ($rootScope.pendingDownloads == 0) {
                          localStorage.setItem("showProgress", 'false');
                        }

                        if (!isUpdating) {
                          if ($location.path() == '/downloads') {
                            $state.reload();
                          }

                          if (subtype == 'magazine') {
                            $rootScope.no_of_magazine_updated = 1;
                            localStorage.setItem('progressDivMags', false);
                            $location.path('/downloads');
                          } else if (subtype == 'book') {
                            $rootScope.no_of_book_updated = 1;
                            localStorage.setItem('progressDivBooks', false);
                            $location.path('/downloads');
                          }
                        }

                        //-------------DOWNLOADING THE THUMBNAIL FOR MAGAZINE END------------------

                      }, function (err) {
                        if (isUpdating) {
                          $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_' + sku).then(function (result) {
                            $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) { }, function (err) { });
                          }, function (error) {

                          });
                        } else {
                          handleErrorInDownload(subtype);
                          $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_' + sku).then(function (result) {
                            $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) { }, function (err) { });
                          }, function (error) {

                          });
                        }
                      });
                  }
                });
                //----------------------- Updating Status of downloads in database ends=============


              }, function (error) // error while downloading--------------------
                {
                  if (!isUpdating) {
                    handleErrorInDownload(subtype);
                  }

                  $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_' + sku).then(function (result) {

                    $cordovaFile.removeRecursively(cordova.file.dataDirectory + 'myDownloads/', subtype + '_cover_' + sku).then(function (res) {
                      $rootScope.no_of_magazine_updated = 0;
                      $rootScope.no_of_book_updated = 0;
                    }, function (err) { });

                  }, function (error) {

                  });
                  return;
                },
                function (progress) {
                  fileTransfer = null;
                  //--------------------- SHOWING DOWNLOAD PROGRESS TEST ENDS
                });


            }

            $cordovaFile.createDir(cordova.file.dataDirectory + 'myDownloads/', subtype + '_' + sku).then(function (result) {
              var SubdirectoryPath = result.nativeURL;

              var coverPath = downloadCover(SubdirectoryPath);


            }, function (error) {
              var SubdirectoryPath = cordova.file.dataDirectory + 'myDownloads/' + subtype + '_' + sku + '/';
              var coverPath = downloadCover(SubdirectoryPath);
            });

            // Creating a sub directory to store unzipped file end================

          }


          //================ FUNCTION TO DOWNLOAD COVER ENDS===========================





          downloadfiles();
          //================ FUNCTION TO DOWNLOAD COVER ENDS===========================
        }




        //====== function to download defination ends here===========================

        //=========== Checking for mydownloads create if not present start==============
        $cordovaFile.checkDir(cordova.file.dataDirectory, 'myDownloads').then(function (res) {
          var directoryPath = res.nativeURL;

          fileDownload(sku, srcUrl, asset_id, version_no, thumbnail, indexVal, forArray, directoryPath, subtype);
        }, function (error) {
          $cordovaFile.createDir(cordova.file.dataDirectory, 'myDownloads').then(function (result) {
            var directoryPath = result.nativeURL;
            fileDownload(sku, srcUrl, asset_id, version_no, thumbnail, indexVal, forArray, directoryPath, subtype);
          }, function (error) {
            $rootScope.no_of_magazine_updated = 0;
            $rootScope.no_of_book_updated = 0;
          })
        });

        //=========== Checking for mydownloads create if not present ends==============



      }


    }

  }])
//=================================///////====================================//

var compareTo = function () {
  return {
    require: "ngModel",
    scope: {
      otherModelValue: "=compareTo"
    },
    link: function (scope, element, attributes, ngModel) {
      ngModel.$validators.compareTo = function (modelValue) {
        return modelValue == scope.otherModelValue;
      };

      scope.$watch("otherModelValue", function () {
        ngModel.$validate();
      });
    }
  };
};
myApp.directive("compareTo", compareTo);