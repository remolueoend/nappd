/**
 * Created by remo on 09/02/15.
 */

var deferred = require('deferred'),
    path = require('path'),
    fs = require('fs'),
    cfgDir = path.join(__dirname, '../cfg'),
    cfgPath = path.join(cfgDir, 'app.json'),
    updated = true;

var deleteFile = deferred.promisify(fs.unlink),
    writeFile = deferred.promisify(fs.writeFile),
    readFile = deferred.promisify(fs.readFile);

/**
 * Returns the current config object.
 */
var getCfg = (function(){
    var cfg;

    return function(){
        var d = deferred();
        if(cfg && !updated) {
            d.resolve(cfg);
        }else{
            fs.exists(cfgPath, function(exists){
                if(exists){
                    fs.readFile(cfgPath, function(err, data){
                        if(!err){
                            cfg = JSON.parse(data);
                            updated = false;
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

})();

/**
 * Updates the config file.
 *
 * @param cfg The config object to write
 */
function update(cfg){
    var d = deferred();
    require('mkdirp')(cfgDir, function(err){
        if(err) d.reject(err);
        else{
            fs.writeFile(cfgPath, JSON.stringify(cfg), function(err){
                if(!err){
                    updated = true;
                    d.resolve();
                }else{
                    d.reject(err);
                }
            });
        }
    });

    return d.promise;
}

/**
 * Returns a registered app instance.
 *
 * @param app The name of the app to get
 */
function getApp(app){
    var d = deferred();
    getCfg().then(function(cfg){
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
}

/**
 * Returns all registered apps.
 */
function getAllApps(){
    return getCfg();
}

/**
 * returns the path to the config file.
 *
 * @returns {string}
 */
function getCfgPath(){
    return cfgPath;
}

/**
 * Adds an app to the config.
 *
 * @param app The name of the app
 * @param path The executable path of the app
 * @param [output] The relative output path
 * @param override Set to true to overwrite an existing app
 */
function addApp(app, path, output){
    var d = deferred();

    if(!app || !app.length){
        d.reject(new Error('No valid app name provided.'));
        return d.promise;
    }
    if(!path || !path.length){
        d.reject(new Error('No valid app path provided.'));
        return d.promise;
    }

    getApp(app).then(function(a){
        d.reject(new Error('There is already an app registered with this name under ' + a.path));
    }, function(){
        updateApp(app, path, output).then(function(){
            d.resolve();
        }, function(err){
            d.reject(err);
        });
    });

    return d.promise;
}

/**
 * Updates or registers a new app.
 *
 * @param path The executable path of the app
 * @param [output] The relative output path
 * @param override Set to true to overwrite an existing app
 */
function updateApp(app, path, output){
    var d = deferred();
    getCfg().then(function(cfg){
        cfg[app] = {
            path: path, output: output
        };
        update(cfg).then(function(){
            d.resolve();
        }, function(err){
            d.reject(err);
        });
    }, function(err){
        d.reject(err);
    });

    return d.promise;
}

/**
 * Removes an app from the config.
 *
 * @param app The name of the app to remove
 */
function removeApp(app){
    var d = deferred();
    getApp(app).then(function(a){
        delete app[app];
        update(cfg).then(function(){
            d.resolve();
        }, function(err){
            d.reject(err);
        })
    }, function(err){
        d.reject(err);
    });

    return d.promise;
}

/**
 * Deletes the configuration for all apps.
 */
function deleteConfig(){
    var d = deferred();
    deleteFile(cfgPath)(function(){
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


module.exports = {
    getApp: getApp,
    addApp: addApp,
    updateApp: updateApp,
    removeApp: removeApp,
    deleteConfig: deleteConfig,
    getCfgPath: getCfgPath,
    getAllApps: getAllApps
};