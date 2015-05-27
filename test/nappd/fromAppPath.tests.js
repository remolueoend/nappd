var nappd = require('../../lib/nappd'),
    path = require('path'),
    c = require('../constants')();

describe('fromAppPath', function(){

    it('should return the daemon of the app path', function(done){
        nappd.fromAppPath(c.appPath)(function(daemon){
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
        nappd.fromAppPath(c.appPath, c.appOut)(function(daemon){
            var err;
            if(!nappd.isDaemon(daemon)){ err = new Error('Object is not an instance of class Daemon.'); }
            else if(daemon.name !== c.appName){ err = new Error('Name of damon does not match.'); }
            else if(daemon.path !== c.appPath){ err = new Error('Path of damon does not match.'); }
            else if(daemon.output !== c.appOut){ err = new Error('Output of damon does not match.'); }
            done(err);
        }, done);
    });

});