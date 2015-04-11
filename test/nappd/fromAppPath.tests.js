var nappd = require('../../lib/nappd'),
    path = require('path'),
    testAppName = 'testApp.js',
    testAppPath = path.join(__dirname, '../../node_modules/daemonize2/examples', testAppName),
    testAppOut = path.join(__dirname, '../../node_modules/daemonize2/examples', 'testApp.out');

describe('fromAppPath', function(){

    it('should return the daemon of the app path', function(done){
        nappd.fromAppPath(testAppPath)(function(daemon){
            done();
        }, done);
    });

    it('should reject if the path does not exist', function(done){
        nappd.fromAppPath('/inexisting_path')(function(daemon){
            done(new Error('Did not reject.'));
        }, function(){
            done();
        });
    });

    it('should return a daemon with the app name, path and output', function(done){
        nappd.fromAppPath(testAppPath, testAppOut)(function(daemon){
            var err;
            if(!nappd.isDaemon(daemon)){ err = new Error('Object is not an instance of class Daemon.'); }
            else if(daemon.name !== testAppName){ err = new Error('Name of damon does not match.'); }
            else if(daemon.path !== testAppPath){ err = new Error('Path of damon does not match.'); }
            else if(daemon.output !== testAppOut){ err = new Error('Output of damon does not match.'); }
            done(err);
        }, done);
    });

});