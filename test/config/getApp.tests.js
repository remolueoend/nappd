
var config = require('../../lib/config')('apps.tests.getApp.json');

describe('getApp', function(){

    var app = 'config_getApp_name',
        path = 'config_getApp_path';

    before(function(done){
        config.addApp(app, path)(function(){
            done();
        }, done);
    });

    after(function(){
        return config.deleteConfig();
    });

    it('should return a registered app', function(done){
        config.getApp(app)(function(a){
            if(a.hasOwnProperty('path') && a.path === path){
                done();
            }else{
                done(new Error('Got wrong app config:' + JSON.stringify(a)));
            }
        }, done);
    });

    it('should reject if no app with the specified name exists', function(done){
        config.getApp('not_registered_app')(function(){
            done(new Error('Resolved not registered app'));
        }, function(err){ done(); });
    });

    it('should reject if no app name was provided', function(done){
        config.getApp(void 0)(function(){
            done(new Error('Did not reject.'));
        }, function(err){ done(); });
    });
});