import resolve from 'rollup-plugin-node-resolve';
import includePaths from 'rollup-plugin-includepaths';

export default {
  input: 'esm/index.js',
  plugins: [
    includePaths({
      include: {
        '@ungap/assign': 'modern/assign.js',
        '@ungap/element-matches': 'modern/element-matches.js',
        '@ungap/weakset': 'modern/weakset.js',
        '@ungap/custom-event': 'modern/custom-event.js',
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
