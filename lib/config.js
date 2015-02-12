/**
 * Created by remo on 09/02/15.
 */

var deferred = require('deferred'),
    path = require('path'),
    fs = require('fs'),
    cfgDir = path.join(__dirname, '../cfg');

var deleteFile = deferred.promisify(fs.unlink),
    writeFile = deferred.promisify(fs.writeFile),
    readFile = deferred.promisify(fs.readFile);

function Config(cfgName){
    if(!(this instanceof Config)) return new Config(cfgName);

    this.cfgPath = path.join(cfgDir, (cfgName || 'apps.json'));
    this.updated = true;
}
Config.prototype = {

    /**
     * Returns the current config object.
     */
    getCfg: (function(){
        var cfg;

        return function(){
            var d = deferred(),
                _this = this;

            if(cfg && !this.updated) {
                d.resolve(cfg);
            }else{
                fs.exists(this.cfgPath, function(exists){
                    if(exists){
                        fs.readFile(_this.cfgPath, function(err, data){
                            if(!err){
                                cfg = JSON.parse(data);
                                _this.updated = false;
                                d.resolve(cfg);
                            }else{
                                d.reject(err);
                            }
                        });
                    }else{
                        cfg = {};
                        d.resolve(cfg);
                    }
                });
            }

            return d.promise;
        }

    })(),

    /**
     * Updates the config file.
     *
     * @param cfg The config object to write
     */
    update: function(cfg){
        var d = deferred(),
            _this = this;

        require('mkdirp')(cfgDir, function(err){
            if(err) d.reject(err);
            else{
                fs.writeFile(_this.cfgPath, JSON.stringify(cfg), function(err){
                    if(!err){
                        _this.updated = true;
                        d.resolve();
                    }else{
                        d.reject(err);
                    }
                });
            }
        });

        return d.promise;
    },

    /**
     * Returns a registered app instance.
     *
     * @param app The name of the app to get
     */
    getApp: function(app){
        var d = deferred();
        this.getCfg().then(function(cfg){
            var a = cfg[app];
            if(a){
                d.resolve(a);
            }else{
                d.reject(new Error('There is no app registered with the name ' + app));
            }
        }, function(){
            d.reject();
        });

        return d.promise;
    },

    /**
     * Returns all registered apps.
     */
    getAllApps: function(){
        return this.getCfg();
    },

    /**
     * Adds an app to the config.
     *
     * @param app The name of the app
     * @param path The executable path of the app
     * @param [output] The relative output path
     * @param override Set to true to overwrite an existing app
     */
    addApp: function(app, path, output){
        var d = deferred(),
            _this = this;

        if(!app || !app.length){
            d.reject(new Error('No valid app name provided.'));
            return d.promise;
        }
        if(!path || !path.length){
            d.reject(new Error('No valid app path provided.'));
            return d.promise;
        }

        this.getApp(app).then(function(a){
            d.reject(new Error('There is already an app registered with this name under ' + a.path));
        }, function(){
            _this.updateApp(app, path, output).then(function(){
                d.resolve();
            }, function(err){
                d.reject(err);
            });
        });

        return d.promise;
    },

    /**
     * Updates or registers a new app.
     *
     * @param path The executable path of the app
     * @param [output] The relative output path
     * @param override Set to true to overwrite an existing app
     */
    updateApp: function(app, path, output){
        var d = deferred(),
            _this = this;

        this.getCfg().then(function(cfg){
            cfg[app] = {
                path: path, output: output
            };
            _this.update(cfg).then(function(){
                d.resolve();
            }, function(err){
                d.reject(err);
            });
        }, function(err){
            d.reject(err);
        });

        return d.promise;
    },

    /**
     * Removes an app from the config.
     *
     * @param app The name of the app to remove
     */
    removeApp: function(app){
        var d = deferred(),
            _this = this;

        deferred(this.getCfg(), this.getApp(app)).then(function(result){
            delete result[0][app];
            _this.update(result[0]).then(function(){
                d.resolve();
            }, function(err){
                d.reject(err);
            });
        }, function(err){
            d.reject(err);
        });

        return d.promise;
    },

    /**
     * Deletes the configuration for all apps.
     */
    deleteConfig: function(){
        var d = deferred(),
            _this = this;

        deleteFile(this.cfgPath)(function(){
            _this.updated = true;
            d.resolve();
        }, function(err){
            if(err.code === 'ENOENT'){ // File not found ==> config already deleted.
                d.resolve();
            }else{
                d.reject(err);
            }
        });

        return d.promise;
    }

};


module.exports = Config;