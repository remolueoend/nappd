var nappd = require('../../lib/nappd');

describe('ctor', function(){
    it('should return a default instance by calling it directly', function(done){
        nappd.config.cfgPath === nappd('/path/to/cfg.json').config.cfgPath ?
            done(new Error('Invalid default instance returned.')) :
            done();
    });
});