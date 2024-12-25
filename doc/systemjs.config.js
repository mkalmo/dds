'use strict';

System.config({

    paths: {
        'unpkg:*': 'https://unpkg.com/*',
    },

    map: {
        'plugin-babel': 'unpkg:systemjs-plugin-babel@0/plugin-babel.js',
        'systemjs-babel-build': 'unpkg:systemjs-plugin-babel@0/systemjs-babel-browser.js',
        'react': 'unpkg:react@18/umd/react.development.js',
        'react-dom': 'unpkg:react-dom@18/umd/react-dom.development.js'
    },

    packages: { "./app/": { defaultExtension: 'js' }},

    transpiler: 'plugin-babel',

    babelOptions: {
        sourceMaps: false,
        react: true
    }
});
