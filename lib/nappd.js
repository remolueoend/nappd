/**
 * Created by remo on 09/02/15.
 */

var config = require('./config')(),
    deferred = require('deferred'),
    daemonize = require('daemonize2'),
    fs = require('fs'),
    path = require('path'),
    Tail = require('tail').Tail;


/**
 * Class representing a registered daemon.
 *
 * @param app The name of the app
 * @param appPath The executable path of the app
 * @param [output] The app output path
 * @constructor
 */
function Daemon(app, appPath, output){
    this.name = app;
    this.path = appPath;
    this.output = output;
    this.events = {};
}

Daemon.prototype = {

    daemon: (function(){
        var _daemon;

        return function(args){
            var d = deferred();
            if(!_daemon){
                try {
                    _daemon = daemonize.setup({
                        main: this.path,
                        name: this.name,
                        stdout: this.output ? fs.openSync(this.output, 'w+') : void 0,
                        pidfile: path.join(path.dirname(this.path), path.basename(this.path) + '.pid'),
                        argv: args,
                        silent: true
                    });
                }catch(err){
                    d.reject(err);
                    return d.promise;
                }

                var _this = this;
                _daemon
                    .on("starting", function() {
                        _this.trigger('starting');
                    })
                    .on("started", function(pid) {
                        _this.trigger('started', [pid]);
                    })
                    .on("stopping", function() {
                        _this.trigger('stopping');
                    })
                    .on("stopped", function(pid) {
                        _this.trigger('stopped', [pid]);
                    })
                    .on("running", function(pid) {
                        _this.trigger('running', [pid]);
                    })
                    .on("notrunning", function() {
                        _this.trigger('notrunning');
                    })
                    .on("error", function(err) {
                        _this.trigger('error', [err]);
                    });
            }
            d.resolve(_daemon);

            return d.promise;
        }
    })(),

    /**
     * Starts the daemon's app.
     *
     * @param [args] App arguments
     */
    start: function(args){
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
    },

    /**
     * Stops the daemon's app.
     */
    stop: function () {
        var d = deferred();
        this.daemon()(function(daemon){
            daemon.stop(function (err, pid) {
                if (err) d.reject(err);
                else d.resolve(pid);
            });
        }, function(err){d.reject(err); });


        return d.promise;
    },

    /**
     * Kill the daemon's app process.
     */
    kill: function(){
        var d = deferred();

        this.daemon()(function(daemon){
            daemon.kill(function (err, pid) {
                if (err) d.reject(err);
                else d.resolve(pid);
            });
        }, function(err){d.reject(err); });

        return d.promise;
    },

    /**
     * Tails the output file of the app.
     * @param rows
     */
    tail: function(callback, rows){
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
    },

    /**
     * Returns a promise resolving the current PID or rejects,
     * if the daemon is not running.
     */
    status: function(){
        var d = deferred();
        this.daemon()(function(daemon){
            var s = daemon.status();
            if(!s) d.reject();
            else d.resolve(s);
        }, function(err){d.reject(err); });

        return d.promise;
    },

    /**
     * Unregisters the daemon.
     */
    unregister: function(){
        var d = deferred();
        config.removeApp(this.name).then(function(){
            d.resolve();
        }, function(err){
            d.reject(err);
        });

        return d.promise;
    },

    /**
     * Adds an event handler to the specified event.
     * @param event
     * @param handler
     */
    on: function(event, handler) {
        this.events[event] = this.events[event] || {};
        var id, _this = this;
        while (this.events[(id = Math.random().toString().substring(2))]) { }
        this.events[event][id] = {
            handler: handler,
            id: id,
            event: event,
            remove: function(){
                delete _this.events[event][id];
            }
        };

        return this.events[event][id];
    },

    /**
     * Triggers all registered handlers of the specified event.
     * @param event
     * @param args
     */
    trigger: function (event, args) {
        if(this.events[event]){
            for(l in this.events[event]){
                if(this.events[event].hasOwnProperty(l)){
                    var listener = this.events[event][l];
                    listener.handler.apply(this, [listener].concat(args || []));
                }
            }
        }
    }
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