/**
 * Created by remo on 09/02/15.
 */

var assert = require('assert'),
    config = require('../lib/config'),
    fs = require('fs');

afterEach(function(){
    config.deleteConfig();
});

describe('config', function(){

    describe('addApp', function(){

        it('should add the app to the config', function(done){
            config.addApp('myApp', 'myPath', 'myOutput')(function(a){
                fs.readFile(config.getCfgPath(), function(err, data){
                    if(err) done(err);
                    done(JSON.parse(data)['myApp'] != null ? null : new Error('App not saved in config file.'));
                });
            }, function(err){
                done(err);
            });
        });

        it('should quit if no app name is provided', function(done){
            config.addApp(null, 'myPath')(function(){
                done(new Error('App saved without an app name'));
            }, function(err){
                done();
            })
        });

        it('should quit if no app path is provided', function(done){
            config.addApp('myApp', null)(function(){
                done(new Error('App saved without app path.'));
            }, function(err){
                done();
            });
        });

        it('should quit if there is already an app with the same name', function(done){
            config.addApp('myApp', 'myPath', 'myOutput')(function(){
                config.addApp('myApp', 'myPath', 'myOutput')(function(){
                    done(new Error('Added app with the same name twice.'));
                }, function(err){
                    done();
                })
            })
        });
    });
});