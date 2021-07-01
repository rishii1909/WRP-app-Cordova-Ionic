// Karma configuration
// Generated on Sun Apr 22 2018 17:07:53 GMT+0530 (IST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
    'http://code.jquery.com/jquery-1.12.4.min.js',
    'node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
    'node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
    'www/lib/ionic/js/ionic.js',
    'node_modules/angular/angular.js',
    'www/lib/ionic/js/ionic-angular.js',
    'node_modules/angular-mocks/angular-mocks.js',
    'www/lib/ionic/js/ionic.bundle.js',
    'www/js/ng-cordova.js',
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular-messages.js',
    'www/js/angular-base64.min.js',
    'node_modules/angular-animate/angular-animate.js',
    'www/js/app.js',
    'www/js/constants.js',
    'www/js/services.js',
    'www/js/controllers/main.js',
    'www/js/controllers/login.js',
    'tests/Controllers/controllers.tests.js',
    'www/js/controllers/forgot-password.js',
    'tests/Controllers/controllers.forgotpd.js'
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
