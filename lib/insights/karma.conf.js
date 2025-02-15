// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
module.exports = function (config) {
    config.set({
        basePath: '../../',

        files: [
            {pattern: 'node_modules/tslib/tslib.js', included: true, watched: false},

            // pdf-js
            {pattern: 'node_modules/pdfjs-dist/build/pdf.js', included: true, watched: false},
            {pattern: 'node_modules/pdfjs-dist/build/pdf.worker.js', included: true, watched: false},
            {pattern: 'node_modules/pdfjs-dist/web/pdf_viewer.js', included: true, watched: false},

            {
                pattern: 'node_modules/@angular/material/prebuilt-themes/indigo-pink.css',
                included: true,
                watched: false
            },

            {pattern: 'node_modules/chart.js/dist/Chart.js', included: true, watched: false},
            {pattern: 'node_modules/raphael/raphael.min.js', included: true, watched: false},
            {
                pattern: 'node_modules/ng2-charts/bundles/ng2-charts.umd.js',
                included: false,
                served: true,
                watched: false
            },

            {pattern: 'node_modules/moment/min/moment.min.js', included: true, watched: false},
            {pattern: 'lib/insights/src/lib/i18n/**/en.json', included: false, served: true, watched: false},
            {pattern: 'lib/insights/**/*.ts', included: false, served: true, watched: false},
            {pattern: 'lib/config/app.config.json', included: false, served: true, watched: false},
        ],

        frameworks: ['jasmine-ajax', 'jasmine', '@angular-devkit/build-angular'],

        proxies: {
            '/base/assets/' :'/base/lib/insights/src/lib/assets/',
            '/assets/adf-insights/i18n/en.json': '/base/lib/insights/src/lib/i18n/en.json',
            '/app.config.json': '/base/lib/config/app.config.json'
        },

        plugins: [
            require('karma-jasmine-ajax'),
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma'),
            require('karma-mocha-reporter')
        ],
        client: {
            clearContext: false,
            jasmine: {
                random: false
            }
        },
        coverageIstanbulReporter: {
            dir: require('path').join(__dirname, '../coverage/insights'),
            reports: ['html', 'lcovonly'],
            fixWebpackSourcePaths: true
        },

        browserDisconnectTimeout: 200000,
        browserNoActivityTimeout: 2400000,
        captureTimeout: 1200000,

        customLaunchers: {
            ChromeHeadless: {
                base: 'Chrome',
                flags: [
                    '--no-sandbox',
                    '--headless',
                    '--disable-gpu',
                    '--remote-debugging-port=9222'
                ]
            }
        },

        reporters: ['mocha', 'kjhtml'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['ChromeHeadless'],
        singleRun: true
    });
};
