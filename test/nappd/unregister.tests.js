
var nappd = require('../../lib/nappd'),
    path = require('path'),
    testAppPath = path.join(__dirname, '../../node_modules/daemonize2/examples', 'testApp.js');

describe('unregister', function(){

    var app = 'nappd_unregister_name';

    function unregister(done){
        nappd.unregister(app)(done, function(){ done(); });
    }
    function register(done){
        nappd.register(app, testAppPath)(done, function(){ done(); });
    }

    beforeEach(function(done){
        register(done);
    });

    afterEach(function(done){
        unregister(done);
    });

    it('should remove a registered app', function(done){
        nappd.unregister(app)(function(){
            nappd.get(app)(function(){
                done(new Error('App was not removed.'));
            }, function(){ done(); });
        }, done);
    });

    it('should reject if the app does not exist', function(done){
        nappd.unregister(app)(function(){
            nappd.unregister(app)(function(){
                done(new Error('Did not reject.'));
            }, function(){ done(); });
        }, done);
    })
});