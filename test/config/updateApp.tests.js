
var config = require('../../lib/config')('apps.tests.updateApp.json');

describe('updateApp', function(){

    var app = 'config_updateApp_name',
        path = 'config_updateApp_path';

    afterEach(function () {
        return config.deleteConfig();
    });

    it('should add the app if it does not exists', function(done){
        config.updateApp(app, path)(function(){
            config.getApp(app)(function(a){
                done();
            }, done);
        }, done);
    });

    it('should update an existing app', function(done){
        var newPath = 'newPath';
        config.addApp(app, path)(function(){
            config.updateApp(app, newPath)(function(a){
                config.getApp(app)(function(a){
                   if(a.path === newPath) done();
                   else done(new Error('App details not updated.'));
                }, done);
            }, done);
        }, done);
    });
});