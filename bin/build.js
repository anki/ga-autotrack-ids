/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Modifications Copyright (C) 2018 Anki, Inc.
 */


/* eslint-env node */
/* eslint require-jsdoc: "off" */


const fs = require('fs-extra');
const glob = require('glob');
const {compile}= require('google-closure-compiler-js');
const {rollup} = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const tmp = require('tmp');
const path = require('path');
const {SourceMapGenerator, SourceMapConsumer} = require('source-map');


const kebabCase = (str) => {
  return str.replace(/([A-Z])/g, (match, p1) => `-${p1.toLowerCase()}`);
};


module.exports = (output, gaAutotrackIdsPlugins = []) => {
  const input = gaAutotrackIdsPlugins.length === 0 ? path.resolve(__dirname, '../lib/index.js') : (() => {
    const tmpIndex = tmp.fileSync({
      postfix: '.js',
      dir: path.resolve(__dirname, '../lib'),
    });
    const contents = gaAutotrackIdsPlugins
                      .map((plugin) => `import './plugins/${kebabCase(plugin)}';`)
                      .join('\n');

    fs.appendFileSync(tmpIndex.name, contents);
    return tmpIndex.name;
  })();

  const plugins = [
    // Correct type annotations for nanoid dependency.
    replace({
      include: path.resolve(__dirname, '../node_modules/nanoid/format.js'),
      delimiters: ['@param {', '}'],
      random: 'number|ArrayBufferView|Array<number>|ArrayBuffer|SharedArrayBuffer',
      size: 'number',
    }),
    // Surpress compiler's multiple variable declariation error for crypto.
    replace({
      include: path.resolve(__dirname, '../node_modules/nanoid/random-browser.js'),
      delimiters: ['', ''],
      'var crypto =': `/** @suppress {checkVars} */\n var crypto =`,
    }),
    commonjs(),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
  ];

  return new Promise((resolve, reject) => {
    rollup({
      input: input,
      plugins: plugins,
    }).then((bundle) => {
      try {
        bundle.generate({
          format: 'es',
          sourcemap: true,
        }).then(async (rollupResult) => {
          const externsDir = path.resolve(__dirname, '../lib/externs');
          const externs = glob.sync(path.join(externsDir, '*.js'))
              .reduce((acc, cur) => acc + fs.readFileSync(cur, 'utf-8'), '');

          const closureFlags = {
            jsCode: [{
              src: rollupResult.code,
              path: path.basename(output),
            }],
            compilationLevel: 'ADVANCED',
            useTypesForOptimization: true,
            outputWrapper:
                '(function(){%output%})();\n' +
                `//# sourceMappingURL=${path.basename(output)}.map`,
            assumeFunctionWrapper: true,
            rewritePolyfills: false,
            warningLevel: 'VERBOSE',
            createSourceMap: true,
            externs: [{src: externs}],
          };

          const closureResult = compile(closureFlags);
          if (closureResult.errors.length || closureResult.warnings.length) {
            const rollupMap = await new SourceMapConsumer(rollupResult.map);

            // Remap errors from the closure compiler output to the original
            // files before rollup bundled them.
            const remap = (type) => (item) => {
              let {line, column, source} = rollupMap.originalPositionFor({
                line: item.lineNo,
                column: item.charNo,
              });
              console.log('remap source', source);
              source = path.relative(
                '.',
                path.resolve(__dirname, '..', source)
              );
              return {type, line, column, source, desc: item.description};
            };
            reject({
              errors: [
                ...closureResult.errors.map(remap('error')),
                ...closureResult.warnings.map(remap('warning')),
              ],
            });
          } else {
            // Currently, closure compiler doesn't support applying its
            // generated source map to an existing source map,
            // so we do it manually.
            const fromMap = JSON.parse(closureResult.sourceMap);
            const toMap = rollupResult.map;

            const generator = SourceMapGenerator.fromSourceMap(
              await new SourceMapConsumer(fromMap));

            generator.applySourceMap(
              await new SourceMapConsumer(toMap), path.basename(output));

            const sourceMap = generator.toString();

            resolve({
              code: closureResult.compiledCode,
              map: sourceMap,
            });
          }
        });
      } catch(err) {
        reject(err);
      }
    }).catch(reject);
  });
};
