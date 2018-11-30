import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'esm/index.js',
  plugins: [
    resolve({
      module: true
    })
  ],
  context: 'null',
  moduleContext: 'null',
  output: {
    exports: 'named',
    file: 'index.js',
    format: 'iife',
    name: 'wickedElements'
  }
};
