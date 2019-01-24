import { terser } from 'rollup-plugin-terser';
//import resolve from 'rollup-plugin-node-resolve';

export default [
  {
    external: ['jquery'],
    input: 'modal-extras.js',
    output: {
      file: 'dist/modal-extras.cjs.js',
      format: 'cjs',
      globals: {
        jquery: '$'
      }
    },
    treeshake: false
  },
  {
    external: ['jquery'],
    input: 'modal-extras.js',
    output: {
      file: 'dist/modal-extras.js',
      format: 'iife',
      name: 'Zaneray.bootstrap.modal',
      globals: {
        jquery: '$'
      }
    },
    treeshake: false
  },
  {
    external: ['jquery'],
    input: 'modal-extras.js',
    output: {
      file: 'dist/modal-extras.min.js',
      format: 'iife',
      name: 'Zaneray.bootstrap.modal',
      globals: {
        jquery: '$'
      }
    },
    treeshake: false,
    plugins: [terser()]
  }
];
