export default [{
    input: 'dist/viking.js',
    name: 'Viking',
    output: {
        file: 'dist/bundle.js',
        format: 'iife',
        sourcemap: true
    }
}, {
    input: 'dist/test/test.js',
    output: {
        file: 'dist/test/bundle.js',
        format: 'iife',
        sourcemap: true
    }
}];
