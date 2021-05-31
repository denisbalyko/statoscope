const fs = require('fs');
const http = require('http');
const open = require('open');
const { transform } = require('../utils');

module.exports = function (yargs) {
  return yargs.command(
    'serve [input]',
    `Start HTTP-server and serve JSON-stats as HTML report
Examples:
Single stats: serve path/to/stats.json
Multiple stats: serve --input path/to/stats-1.json path/to/stats-2.json
`,
    (yargs) => {
      return yargs
        .positional('input', {
          describe: 'path to a stats.json',
          alias: 'i',
          type: 'string',
        })
        .option('port', {
          alias: 'p',
          default: '8080',
        })
        .option('host', {
          alias: 'h',
          default: 'localhost',
        })
        .option('open', {
          describe: 'open browser after start',
          alias: 'o',
        })
        .array('input')
        .demandOption('input');
    },
    async (argv) => {
      console.log(`Generating Statoscope report...`);
      const reportPath = await transform(argv.input);
      console.log(`Statoscope report generated`);

      http
        .createServer((req, res) => {
          fs.createReadStream(reportPath).pipe(res);
        })
        .listen(argv.port, argv.host)
        .on('listening', () => {
          const link = `http://${argv.host}:${argv.port}`;
          console.log(`Statoscope server listen at ${link}`);

          if (argv.open) {
            open(link);
          }
        });
    }
  );
};
