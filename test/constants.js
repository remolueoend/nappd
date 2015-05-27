var path = require('path'),
    extend = require('extend');

var DEF_OPTS = {
    appName: 'testApp.js',
    appOutName: 'testApp.out',
    appFolder: path.join(__dirname, '../node_modules/daemonize2/examples'),
};

module.exports = function(options){
    var opts = extend({}, options, DEF_OPTS);
    opts.appPath = path.join(opts.appFolder, opts.appName);
    opts.appOut = path.join(opts.appFolder, opts.appOutName);

    return opts;
};