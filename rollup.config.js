import { defineConfig } from 'rollup';
import terser from '@rollup/plugin-terser';

export default defineConfig({
    input: 'src/index.js',
    output: [
        {
            file: 'dist/easy-frame.esm.js',
            format: 'esm'
        },
        {
            file: 'dist/easy-frame.umd.js',
            format: 'umd',
            name: 'EasyFrame'
        },
        {
            file: 'dist/easy-frame.umd.min.js',
            format: 'umd',
            name: 'EasyFrame',
            plugins: [terser()]
        }
    ],
    context: 'window'
});