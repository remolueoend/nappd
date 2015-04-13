var nappd = require('../../lib/nappd'),
    path = require('path'),
    testAppName = 'testApp.js',
    testAppPath = path.join(__dirname, '../../node_modules/daemonize2/examples', testAppName),
    testEvent = 'testEvent';

describe('on', function(){

    it('should return a listener instance', function(done){
        nappd.fromAppPath(testAppPath)(function(daemon){
            var l = daemon.on(testEvent, function(){ });
            if(l && l.id && l.handler && l.event)
                done();
            else
                done(new Error('Invalid listener returned.'));
        }, done);
    });

    it('should add a listener to the events collection', function(done){
        nappd.fromAppPath(testAppPath)(function(daemon){
            var l = daemon.on(testEvent, function(){ });
            daemon.events[testEvent][l.id] ? done() : done(new Error('Listener was not added to collection'));
        }, done);
    });

    describe('listener', function(){

        it('should remove itself by calling remove', function(done){
            nappd.fromAppPath(testAppPath)(function(daemon){
                var l = daemon.on(testEvent, function(){ });
                l.remove();
                daemon.events[testEvent][l.id] ? done(new Error('Listener was not removed from collection')) : done();
            }, done);
        });

    });
});