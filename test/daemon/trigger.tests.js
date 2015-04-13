var nappd = require('../../lib/nappd'),
    path = require('path'),
    testAppName = 'testApp.js',
    testAppPath = path.join(__dirname, '../../node_modules/daemonize2/examples', testAppName),
    testEvent = 'testEvent';

describe('trigger', function(){

    it('should trigger a registered listener', function(done){
        nappd.fromAppPath(testAppPath)(function(daemon){
            var to;
            daemon.on(testEvent, function(){
                clearTimeout(to);
                done();
            });
            to = setTimeout(function(){ done(new Error('Listener was not called in a acceptable range of time.')); }, 1000);
            daemon.trigger(testEvent);

        }, done);
    });

    it('should provide the specified data and the listener instance to the handler', function(done){
        nappd.fromAppPath(testAppPath)(function(daemon){
            var to;
            daemon.on(testEvent, function(l, data){
                clearTimeout(to);
                if(l && l.id && l.event && l.handler && l.remove && data === 'data')
                    done();
                else
                    done(new Error('Invalid parameters in listener call.'));
            });
            to = setTimeout(function(){ done(new Error('Listener was not called in a acceptable range of time.')); }, 1000);
            daemon.trigger(testEvent, 'data');

        }, done);
    });

});