
var config = require('../../lib/config')('app.tests.deleteConfig.json'),
    fs = require('fs');

describe('deleteConfig', function(){

    var app = 'config_deleteConfig_name',
        path = 'config_deleteConfig_path';

    afterEach(function(){
        return config.deleteConfig();
    });

    it('should delete the config file', function(done){
        config.addApp(app, path)(function(){
            config.deleteConfig()(function(){
                fs.exists(config.cfgPath, function(err, exists){
                    if(err) done(err);
                    else{
                        done(!exists ? null : new Error('Config file was not deleted.'));
                    }
                });
            }, done);
        }, done);
    });

    it('should resolve if the config file dos not exist', function(){
        return config.deleteConfig();
    });
});