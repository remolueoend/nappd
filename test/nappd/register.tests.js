
var nappd = require('../../lib/nappd'),
    path = require('path'),
    c = require('../constants')();

describe('register', function(){

    var app = 'nappd_register_name';

    function unregister(done){
        nappd.unregister(app)(done, function(){ done(); });
    }

    before(function(done){
        unregister(done);
    });

    afterEach(function(done){
        unregister(done);
    });

    it('should add an app to the registered daemons', function(done){
        nappd.register(app, c.appPath)(function(){
            nappd.fromRegisteredApp(app)(function(app){
                done();
            }, done);
        }, done);
    });

    it('should reject if the app already exists', function(done){
        nappd.register(app, c.appPath)(function(){
            nappd.register(app, c.appPath)(function(){
                done(new Error('Did not reject.'));
            }, function(){ done(); });
        }, done)
    });

    it('should overwrite the options if overwrite is set to true', function(done){
        nappd.register(app, c.appPath)(function(){
            nappd.register(app, c.appPath, c.appOut, true)(function(){
                nappd.fromRegisteredApp(app)(function(a){
                    if(a.output === c.appOut) done();
                    else done(new Error('App was not updated correctly.'));
                }, done)
            }, done);
        }, done);
    });

    it('should reject if the app name is missing', function(done){
        nappd.register(void 0, c.appPath)(function(){
            done(new Error('Did not reject.'));
        }, function(){ done(); })
    });

    it('should reject if the app path is missing', function(done){
        nappd.register(app, void 0)(function(){
            done(new Error('Did not reject.'));
        }, function(){ done(); })
    });
});