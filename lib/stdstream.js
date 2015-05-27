var util = require('util'),
    Transform = require('stream').Transform;

function StdStream(options){
    Transform.call(this, options);
    this.buffer = '';
}

util.inherits(StdStream, Transform);

StdStream.prototype._transform = function(chunk, encoding, done){
    var str = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;
    var li = str.indexOf('\n');
    if(li !== -1){
        this.buffer += str.substring(0, li);
        this.__onLineReceived();
    }else{
        this.buffer += str;
    }

    done(null, chunk);
};

StdStream.prototype._flush = function(done){
    this.push(this.buffer);
    done();
};

StdStream.prototype.__onLineReceived = function(){
    this.emit('line', this.buffer);
    this.buffer = '';
};

module.exports = StdStream;