export default [{
    name: 'Viking',
    input: 'dist/viking.js',
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
