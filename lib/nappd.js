
var program = require('commander');

program.version('0.0.6');
program.command('start <app> [args...]', 'starts an app as a daemon.');
program.command('stop <app>', 'stops a running daemon of an app.');


program.parse(process.argv);

