import resolve from 'rollup-plugin-node-resolve';
import includePaths from 'rollup-plugin-includepaths';

export default {
  input: 'esm/index.js',
  plugins: [
    includePaths({
      include: {
        '@ungap/assign': 'node_modules/@ungap/degap/assign.js',
        '@ungap/element-matches': 'node_modules/@ungap/degap/element-matches.js',
        '@ungap/weakset': 'node_modules/@ungap/degap/weakset.js',
        '@ungap/custom-event': 'node_modules/@ungap/degap/custom-event.js',
      },
    }),
    resolve({
      module: true
    })
  ],
  context: 'null',
  moduleContext: 'null',
  output: {
    exports: 'named',
    file: 'modern.js',
    format: 'iife',
    name: 'wickedElements'
  }
};
