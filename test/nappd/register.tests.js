
var nappd = require('../../lib/nappd'),
    path = require('path'),
    testAppPath = path.join(__dirname, '../../node_modules/daemonize2/examples', 'testApp.js'),
    testAppOut = path.join(__dirname, '../../node_modules/daemonize2/examples', 'testApp.out');

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
        nappd.register(app, testAppPath)(function(){
            nappd.get(app)(function(app){
                done();
            }, done);
        }, done);
    });

    it('should reject if the app already exists', function(done){
        nappd.register(app, testAppPath)(function(){
            nappd.register(app, testAppPath)(function(){
                done(new Error('Did not reject.'));
            }, function(){ done(); });
        }, done)
    });

    it('should overwrite the options if overwrite is set to true', function(done){
        nappd.register(app, testAppPath)(function(){
            nappd.register(app, testAppPath, testAppOut, true)(function(){
                nappd.get(app)(function(a){
                    if(a.output === testAppOut) done();
                    else done(new Error('App was not updated correctly.'));
                }, done)
            }, done);
        }, done);
    });

    it('should reject if the app name is missing', function(done){
        nappd.register(void 0, testAppPath)(function(){
            done(new Error('Did not reject.'));
        }, function(){ done(); })
    });

    it('should reject if the app path is missing', function(done){
        nappd.register(app, void 0)(function(){
            done(new Error('Did not reject.'));
        }, function(){ done(); })
    });
});