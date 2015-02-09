/**
 * Created by remo on 09/02/15.
 */

var config = require('./config'),
    deferred = require('deferred');


/**
 * Class representing a registered daemon.
 *
 * @param app The name of the app
 * @param path The executable path of the app
 * @param [output] The app output path
 * @constructor
 */
function Daemon(app, path, output){
    this.name = app;
    this.path = path;
    this.output = output;
}

/**
 * Returns a new registered app instance.
 *
 * @param app The name of the app to get
 */
Daemon.get = function(app){
    var d = deferred();
    config.getApp(app).then(function(a){
        d.resolve(new Daemon(a.name, a.path, a.output));
    }, function(err){
        d.reject(err);
    });

    return d.promise;
};

/**
 * Registers a new daemon.
 *
 * @param app The name of the app
 * @param path The executable path of the app
 * @param [output] The app output
 * @param [overwrite] Set true to overwrite an existing app.
 * @returns {*}
 */
Daemon.register = function(app, path, output, overwrite){
    return config[!overwrite ? 'addApp' : 'updateApp'](app, path, output);
};

Daemon.prototype = {

    /**
     * Starts the daemon's app.
     *
     * @param [args] App arguments
     */
    start: function(args){

    },

    /**
     * Stops the daemon's app.
     */
    stop: function () {

    },

    /**
     *
     * @param rows
     */
    tail: function(rows){
        if(this.output){

        }else{
            throw 'No output defined for this app.';
        }
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
    }
};


module.exports = Daemon;