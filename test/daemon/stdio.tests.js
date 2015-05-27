var nappd = require('../../lib/nappd'),
    path = require('path'),
    fs = require('fs'),
    deferred = require('deferred'),
    c = require('../constants')(),
    testApp;

describe('stdio', function(){

    describe('sdtout', function() {

        it('should emit event \'line\' for each printed line', function (done) {
            nappd.fromAppPath(c.appPath)(function (daemon) {
                testApp = daemon;
                var line = '';
                daemon.stdout.on('line', function (l) {
                    line = l;
                });

                daemon.on('stopped', function(){
                    done(line !== 'Hello World!' ? new Error('Invalid output') : void 0);
                });

                daemon.start();
            }, done);
        });

        it('should redirect output to file path', function(done){
            var dStream = deferred(), dFile = deferred();
            nappd.fromAppPath(c.appPath, c.appOut)(function (daemon) {
                testApp = daemon;
                daemon.stdout.on('line', function (line) {
                    dStream.resolve(line);
                });
                daemon.on('stopped', function(e, pid){
                    fs.readFile(c.appOut, function (err, data) {
                        if(err) dFile.reject(err);
                        dFile.resolve(data);
                    });
                });
                daemon.start();

                deferred(dStream.promise, dFile.promise)(function(lines){
                    done(lines[0] === 'Hello World!' && lines[1].toString() === 'Hello World!\n' ? void 0 : new Error('Invalid output'));
                }, done);

            }, done);
        });
    });
});