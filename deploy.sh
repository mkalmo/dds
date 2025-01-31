set -e

npx webpack

path='/var/www/html/dds'

cp index-dist.html ${path}/index.html
cp styles.css ${path}
cp out.js ${path}

mkdir -p ${path}/dist

cp dist/code.bundle.js ${path}/dist

