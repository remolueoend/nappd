/**
 * Created by remo on 09/02/15.
 */

var config = require('./config')(),
    deferred = require('deferred'),
    daemonize = require('daemonize2'),
    StdStream = require('./stdstream'),
    ontrigger = require('ontrigger'),
    fs = require('fs'),
    path = require('path'),
    Tail = require('tail').Tail,
    getStdStream = function(o){
        var stream = new StdStream();
        var redStream = typeof o === 'string' ? fs.createWriteStream(o) : o;
        if(redStream){
            stream.pipe(redStream);
        }

        return stream;
    };

/**
 * Class representing a registered daemon.
 *
 * @param app The name of the app
 * @param appPath The executable path of the app
 * @param [output] The app output path
 * @constructor
 */
function Daemon(app, appPath, output){
    ontrigger.super(this);
    this.name = app;
    this.path = appPath;
    this.output = output;
    this.events = {};
    this.stdout = getStdStream(typeof output === 'object' ? output.stdout : output);
    this.stderr = output && output.stderr ? getStdStream(output.stderr) : this.stdout;
    this._d = null;
}

ontrigger(Daemon);


Daemon.prototype.daemon = (function(){
    var _daemon;

    return function(args){
        var d = deferred();
        if(!this._d){
            try {
                this._d = daemonize.setup({
                    main: this.path,
                    name: this.name,
                    stdout: this.stdout,
                    stderr: this.stderr,
                    pidfile: path.join(path.dirname(this.path), path.basename(this.path) + '.pid'),
                    argv: args,
                    silent: true
                });
            }catch(err){
                d.reject(err);
                return d.promise;
            }

            var _this = this;
            this._d
                .on("starting", function() {
                    _this.trigger('starting');
                })
                .on("started", function(pid) {
                    _this.trigger('started', pid);
                })
                .on("stopping", function() {
                    _this.trigger('stopping');
                })
                .on("stopped", function(pid) {
                    _this.trigger('stopped', pid);
                })
                .on("running", function(pid) {
                    _this.trigger('running', pid);
                })
                .on("notrunning", function() {
                    _this.trigger('notrunning');
                })
                .on("error", function(err) {
                    _this.trigger('error', err);
                });
        }
        d.resolve(this._d);

        return d.promise;
    }
})();

/**
 * Starts the daemon's app.
 *
 * @param [args] App arguments
 */
Daemon.prototype.start = function(args){
    var d = deferred();
    this.daemon(args)(function(daemon){
        daemon.start(function(err, pid){
            if(err) d.reject(err);
            else d.resolve(pid);
        });
    }, function(err){
        d.reject(err);
    });

    return d.promise;
};

/**
 * Stops the daemon's app.
 */
Daemon.prototype.stop = function () {
    var d = deferred();
    this.daemon()(function(daemon){
        daemon.stop(function (err, pid) {
            if (err) d.reject(err);
            else d.resolve(pid);
        });
    }, function(err){d.reject(err); });


    return d.promise;
};

/**
 * Kill the daemon's app process.
 */
Daemon.prototype.kill = function(){
    var d = deferred();

    this.daemon()(function(daemon){
        daemon.kill(function (err, pid) {
            if (err) d.reject(err);
            else d.resolve(pid);
        });
    }, function(err){d.reject(err); });

    return d.promise;
};

/**
 * Tails the output file of the app.
 * @param rows
 */
Daemon.prototype.tail = function(callback, rows){
    if(this.output){
        var tail = new Tail(this.output);
        tail.on('line', function(data){
            callback(null, data);
        });
        tail.on('error', function(err){
            callback(err);
        });

        return function(){
            tail.unwatch();
        }
    }else{
        throw 'No output defined for this app.';
    }
};

/**
 * Returns a promise resolving the current PID or rejects,
 * if the daemon is not running.
 */
Daemon.prototype.status = function(){
    var d = deferred();
    this.daemon()(function(daemon){
        var s = daemon.status();
        if(!s) d.reject();
        else d.resolve(s);
    }, function(err){d.reject(err); });

    return d.promise;
};

/**
 * Unregisters the daemon.
 */
Daemon.prototype.unregister = function(){
    var d = deferred();
    config.removeApp(this.name).then(function(){
        d.resolve();
    }, function(err){
        d.reject(err);
    });

    return d.promise;
};

function Nappd(cfgPath){
    this.config = require('./config')(cfgPath);
}
Nappd.prototype = {
    /**
     * Returns a new daemon instance from a registered app.
     * @param appName The name of the registered app.
     * @returns {Promise}
     */
    fromRegisteredApp: function(appName){
        var d = deferred();
        this.config.getApp(appName).then(function(a){
            try{
                var daemon = new Daemon(appName, a.path, a.output);
                d.resolve(daemon);
            }catch(err){
                d.reject(err);
            }
        }, function(err){
            d.reject(err);
        });

        return d.promise;
    },

    /**
     * Returns a new daemon instance for the provided app path.
     * @param appPath The absolute file path to the app
     * @param [outputPath] An absolute path to the output file.
     * @returns {Promise}
     */
    fromAppPath: function(appPath, outputPath){
        var d = deferred();
        fs.exists(appPath, function(exists){
            if(exists){
                try{
                    var fn = path.basename(appPath).split()[0];
                    var daemon = new Daemon(fn, appPath, outputPath);
                    d.resolve(daemon);
                }catch(err){
                    d.reject(err);
                }
            }else{
                d.reject(new Error('App path does not exist.'));
            }
        });

        return d.promise;
    },

    /**
     * Registers a new daemon.
     *
     * @param app The name of the app
     * @param path The executable path of the app
     * @param [output] The app output
     * @param [overwrite] Set true to overwrite an existing app.
     * @returns {*}
     */
    register: function(app, path, output, overwrite){
        return this.config[!overwrite ? 'addApp' : 'updateApp'](app, path, output);
    },

    /**
     * Unregisters a daemon.
     * @param app Name of the daemon's app.
     */
    unregister: function(app){
        var d = deferred();
        this.config.removeApp(app).then(function(){
            d.resolve();
        }, function(err){
            d.reject(err);
        });

        return d.promise;
    },

    /**
     * Returns if the given instance if a daemon.
     * @param instance The instance to test
     * @returns {boolean}
     */
    isDaemon: function(instance){
        return instance instanceof Daemon;
    }
};

var nappd = function(cfgConfig){
    return new Nappd(cfgConfig);
};
nappd.__proto__ = new Nappd();

module.exports = nappd;