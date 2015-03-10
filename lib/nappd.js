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
                        pidfile: path.join(path.dirname(this.path), 'daemon.pid'),
                        argv: args,
                        silent: true
                    });
                }catch(err){
                    d.reject(err);
                }

                var _this = this;
                _daemon
                    .on("starting", function() {
                        _this.trigger('starting');
                        //console.log("Starting daemon...");
                    })
                    .on("started", function(pid) {
                        _this.trigger('started', [pid]);
                        //console.log("Daemon started. PID: " + pid);
                    })
                    .on("stopping", function() {
                        _this.trigger('stopping');
                        //console.log("Stopping daemon...");
                    })
                    .on("stopped", function(pid) {
                        _this.trigger('stopped', [pid]);
                        //console.log("Daemon stopped.");
                    })
                    .on("running", function(pid) {
                        _this.trigger('running', [pid]);
                        //console.log("Daemon already running. PID: " + pid);
                    })
                    .on("notrunning", function() {
                        _this.trigger('notrunning');
                        //console.log("Daemon is not running");
                    })
                    .on("error", function(err) {
                        _this.trigger('error', [err]);
                        //console.log("Daemon failed to start:  " + err.message);
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
        this.daemon(args)(function(d){
            d.start(function(err, pid){
                if(err) d.reject(err);
                else d.resolve(pid);
            });
        }, function(err){ d.reject(err); });

        return d.promise;
    },

    /**
     * Stops the daemon's app.
     */
    stop: function () {
        var d = deferred();
        this.daemon()(function(d){
            d.stop(function (err, pid) {
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

        this.daemon()(function(d){
            d.kill(function (err, pid) {
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
        this.daemon()(function(d){
            var s = this.daemon.status();
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
    on: function(event, handler){
        this.events[event] = this.events[event] || [];
        this.events[event].push(handler);
    },

    /**
     * Triggers all registered handlers of the specified event.
     * @param event
     * @param args
     */
    trigger: function (event, args) {
        if(this.events[event]){
            this.events[event].forEach(function(h){
                h.apply(this, args);
            });
        }
    }
};


module.exports = {

    /**
     * Returns a new registered app instance.
     *
     * @param app The name of the app to get
     */
    get: function(app){
        var d = deferred();
        config.getApp(app).then(function(a){
            try{
                var daemon = new Daemon(app, a.path, a.output);
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
     * Registers a new daemon.
     *
     * @param app The name of the app
     * @param path The executable path of the app
     * @param [output] The app output
     * @param [overwrite] Set true to overwrite an existing app.
     * @returns {*}
     */
    register: function(app, path, output, overwrite){
        return config[!overwrite ? 'addApp' : 'updateApp'](app, path, output);
    },

    /**
     * Unregisters a daemon.
     * @param app Name of the daemon's app.
     */
    unregister: function(app){
        var d = deferred();
        config.removeApp(app).then(function(){
            d.resolve();
        }, function(err){
            d.reject(err);
        });

        return d.promise;
    }
};