
const transform = (filename, code) => Babel.transform(code, {
    presets: ['react', 'typescript'],
    filename: filename,
    plugins: ['transform-modules-systemjs'],
}).code;

System.shouldFetch = () => true;

System.constructor.prototype.fetch = async url => {
    const filename = url.split('/').pop();
    if (!filename.endsWith('.tsx') && !filename.endsWith('.ts')) {
        return fetch(url);
    }

    const response = await fetch(url);

    const code = transform(filename, await response.text());

    const modifiedResponse = new Response(code, {
        status: response.status,
        headers: {
            'Content-type': 'text/javascript',
        },
    });

    return Promise.resolve(modifiedResponse);
};
