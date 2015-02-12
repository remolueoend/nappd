
var config = require('../../lib/config')('apps.tests.removeApp.json'),
    fs = require('fs');

describe('removeApp', function(){

    before(function(){
        return config.deleteConfig();
    });

    var app = 'config_removeApp_name',
        path = 'config_removeApp_path';

    it('should remove a registered app', function(done){
        config.addApp(app, path)(function(){
            config.removeApp(app)(function(){
                fs.readFile(config.cfgPath, function(err, data){
                    if(err) done(err);
                    else{
                        done(JSON.parse(data)[app] == null ? null : new Error('App not removed from config.'))
                    }
                }, done)
            }, done)
        }, done);
    });

});