import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import includePaths from 'rollup-plugin-includepaths';
import { terser } from "rollup-plugin-terser";

const settings = {
  input: './esm/index.js',
  plugins: [
    includePaths({
      include: {},
    }),
    resolve({module: true}),
    babel({presets: ['@babel/preset-env']})
  ],
  context: 'null',
  moduleContext: 'null',
  output: {
    file: './bundle.mjs',
    format: 'es'
  }
}

export default [
  {
    ...settings,  
    output: {...settings.output,  file: './bundle.mjs' } 
  },
  {
    ...settings,  
    output: {...settings.output, file: './bundle-min.mjs' },
    plugins: [...settings.plugins, terser()]
  }
]
