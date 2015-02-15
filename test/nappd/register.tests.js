
var nappd = require('../../lib/nappd'),
    path = require('path'),
    testAppPath = path.join(__dirname, 'testApp.js');

describe('register', function(){

    var app = 'nappd_register_name';

    function unregister(done){
        nappd.get(app)(function(a){
            a.unregister()(done, function(){ done(); });
        }, function(err){
            done();
        });
    }

    before(function(done){
        unregister(done);
    });

    afterEach(function(done){
        unregister(done);
    });

    it('should add an app to the registered daemons', function(done){
        nappd.register(app, testAppPath)(function(){
            nappd.get(app)(done, done);
        }, done);
    });

});