const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const uglify = require('uglify-js')

const configs = [
  {
    entry: 'src/main.js',
    format: 'cjs',
    dest: 'dist/org.cjs.js'
  },
  {
    entry: 'src/main.js',
    format: 'iife',
    moduleName: 'Org',
    dest: 'dist/org.iife.js'
  }
];

function build(config) {
  const isProd = /min\.js$/.test(config.dest);
  return rollup.rollup(config).then(bundle => {
    const code = bundle.generate(config).code;
    return write(config.dest, code);
  })
}

function write(dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err);
      console.log(`${path.relative(process.cwd(), dest)} ${getSize(code)}`);
      resolve();
    })
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb';
}

for (let config of configs) {
  build(config);
}
