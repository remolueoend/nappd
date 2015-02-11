/**
 * Created by remo on 09/02/15.
 */

var assert = require('assert'),
    config = require('../lib/config'),
    fs = require('fs'),
    should = require('should');

describe('config', function(){

    describe('addApp', function(){

        var app = 'config_addApp_name',
            path = 'config_addApp_path';

        afterEach(function(){
            return config.deleteConfig();
        });

        it('should add the app to the config', function(done){
            config.addApp(app, path)(function(a){
                fs.readFile(config.getCfgPath(), function(err, data){
                    if(err) done(err);
                    done(JSON.parse(data)[app] != null ? null : new Error('App not saved in config file.'));
                });
            }, function(err){
                done(err);
            });
        });

        it('should reject if no app name is provided', function(done){
            config.addApp(null, path)(function(){
                done(new Error('App saved without an app name'));
            }, function(err){
                done();
            })
        });

        it('should reject if no app path is provided', function(done){
            config.addApp(app, null)(function(){
                done(new Error('App saved without app path.'));
            }, function(err){
                done();
            });
        });

        it('should reject if there is already an app with the same name', function(done){
            config.addApp(app, path)(function(){
                config.addApp(app, path)(function(){
                    done(new Error('Added app with the same name twice.'));
                }, function(err){
                    done();
                })
            })
        });
    });



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

        it('should reject if no app with the specified na exists', function(done){
            config.getApp('not_registered_app')(function(){
                done(new Error('Resolved not registered app'));
            }, function (err){
                done();
            })
        });

    });
});