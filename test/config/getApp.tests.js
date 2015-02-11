
var config = require('../../lib/config');

describe('getApp', function(){

    var app = 'config_getApp_name',
        path = 'config_getApp_path';

    before(function(done){
        config.deleteConfig()(function(){
            config.addApp(app, path)(function(){
                done();
            }, function(err){ done(err); });
        }, function(err){ done(err); });
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
        }, function(err){
            done(err);
        });
    });

    it('should reject if no app with the specified name exists', function(done){
        config.getApp('not_registered_app')(function(){
            done(new Error('Resolved not registered app'));
        }, function (err){
            done();
        })
    });

});