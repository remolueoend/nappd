[![Build Status](https://travis-ci.org/remolueoend/nappd.svg?branch=master)](https://travis-ci.org/remolueoend/nappd)

# nappd
nappd stands for node app daemon and allows you programatically start and stop NodeJS apps running in the background as a daemon.

## Installation
```
npm install nappd
```

## Usage
All public methods provided by nappd (except ```nappd.isDaemon```) return a promise object as defined in https://www.npmjs.com/package/deferred.

```javascript
var nappd = require('nappd');
```

### fromAppPath
Resolves a daemon instance by a file path of an app:
```javascript
nappd.fromAppPath('path/to/app.js').then(function(daemon){ }, function(err){ });
```

### fromRegisteredApp
Resolves a daemon instance by the name of a registered app:
```javascript
nappd.fromRegisteredApp('appName').then(function(daemon){ }, function(err){ });
```



