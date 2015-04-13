[![Build Status](https://travis-ci.org/remolueoend/nappd.svg?branch=master)](https://travis-ci.org/remolueoend/nappd)

# nappd
nappd stands for node app daemon and can be used to create app daemons running in the background from any NodeJS script.
Furthermore, nappd allows you to register apps locally which simplifies the management of your apps.

If you wish to manage your NodeJS app daemons straight from your terminal, have a look at [nappd-cli](https://www.npmjs.com/package/nappd-cli).

## Registration
Registering an app together with its config makes the handling of its daemon much easier.
After an app was registered with a unique app name, The daemon and the app's configuration can be received at any time by simply providing the app's unique name.
The apps' configuration will be saved in a JSON based file. The default location is: ```nappd_module_folder/cfg/apps.json```. This location can be overwritten at any time (See [Usage](https://github.com/remolueoend/nappd-cli#usage))

## Installation
```
npm install nappd [--save]
```

## Usage
```javascript
// Returns a default nappd instance:
var nappd = require('nappd');

// Returns a new nappd instance with a custom config location.
// The path can be absolute or relative to the current working directory:
var nappd = require('nappd')('path/to/config.json');

require('nappd') === require('nappd')       // true
require('nappd')() === require('nappd')()   // false
require('nappd') === require('nappd')()     // false
require('nappd').config.cfgPath === require('nappd')().config.cfgPath   // true
```

## Module Methods
All public methods provided by nappd (except ```nappd.isDaemon```) return a promise object as defined in https://www.npmjs.com/package/deferred.  

### fromAppPath
Resolves a daemon instance by a file path of an app:
```javascript
nappd.fromAppPath(appPath, [output]).then(function(daemon){ }, function(err){ });
```
* ```appPath```: Required. The file path of the script to execute.
* ```output```: Optional path to the app output log. The path will be created recursively if necessary.

### fromRegisteredApp
Resolves a daemon instance by the name of a registered app:
```javascript
nappd.fromRegisteredApp(appName).then(function(daemon){ }, function(err){ });
```
* ```appName```: Required. The unique name of the app.

### register
Registers an app under a unique app name:
```javascript
nappd.register(appName, appPath, [output], [overwrite=false]).then(function(){}, function(err){}); 
```
* ```appName```: Required. A unique name of the app to register.
* ```appPath```: Required. The absolute file path to the app's script file.
* ```output```: An optional absolute path to the app's output file.
* ```overwrite```: Optional. Set to true to overwrite the config of an app with the same name.

### unregister
Unregisters a previously registered app:
```javascript
nappd.unregister(appName).then(function(){}, function(err){}); 
```
* ```appName```: Required. The unique name of the app.

### isDaemon
Returns if the specified object is a daemon instance:
```javascript
var isDaemon = nappd.isDaemon(instance); 
```
* ```instance```: The object to test.