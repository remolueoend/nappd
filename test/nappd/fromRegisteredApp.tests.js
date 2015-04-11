var nappd = require('../../lib/nappd'),
    path = require('path'),
    testAppPath = path.join(__dirname, '../../node_modules/daemonize2/examples', 'testApp.js'),
    testAppOut = path.join(__dirname, '../../node_modules/daemonize2/examples', 'testApp.out'),
    app = 'nappd_fromRegisteredApp_name';

    function unregister(done){
        nappd.unregister(app)(done, function(){ done(); });
    }
    function register(){
        return nappd.register(app, testAppPath, testAppOut);
    }

describe('fromRegisteredApp', function(){

    afterEach(function(done){
        unregister(done);
    });

    before(function(done){
        unregister(done);
    });

    it('should resolve the daemon of a previously registered app', function(done){
        register()(function(){
            nappd.fromRegisteredApp(app)(function(daemon){
                done();
            }, done);
        }, done);
    });

    it('should reject if the app is not registered', function(done){
        nappd.fromRegisteredApp(app)(function(daemon){
            done(new Error('It did not reject.'));
        }, function(){
            done();
        });
    });

    it('should reject if no app name is provided', function(done){
        nappd.fromRegisteredApp()(function(daemon){
            done(new Error('It did not reject.'));
        }, function(){
            done();
        });
    });
});