
var config = require('../../lib/config')('apps.tests.addApp.json'),
    fs = require('fs');

describe('addApp', function () {

    var app = 'config_addApp_name',
        path = 'config_addApp_path';

    afterEach(function () {
        return config.deleteConfig();
    });

    it('should add the app to the config', function (done) {
        config.addApp(app, path)(function (a) {
            fs.readFile(config.cfgPath, function (err, data) {
                if (err) done(err);
                done(JSON.parse(data)[app] != null ? null : new Error('App not saved in config file.'));
            });
        }, done);
    });

    it('should reject if no app name is provided', function (done) {
        config.addApp(null, path)(function () {
            done(new Error('App saved without an app name'));
        }, function(){ done(); })
    });

    it('should reject if no app path is provided', function (done) {
        config.addApp(app, null)(function () {
            done(new Error('App saved without app path.'));
        }, function(){ done(); });
    });

    it('should reject if there is already an app with the same name', function (done) {
        config.addApp(app, path)(function () {
            config.addApp(app, path)(function () {
                done(new Error('Added app with the same name twice.'));
            }, function(err){ done(); })
        })
    });
});