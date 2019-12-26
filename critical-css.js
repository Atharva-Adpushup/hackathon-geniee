const critical = require('critical');

critical.generate({
    inline: true,
    base: 'clientDist/',
    src: 'index.html',
    minify: true,
    dest: 'index.html',
    width: 1300,
    height: 900
});