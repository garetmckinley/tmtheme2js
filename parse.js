const plist = require('plist'),
      walk = require('walk'),
      fs = require('fs'),
      handlebars = require('handlebars'),
      immutable = require('immutable');

const walker = walk.walk('Colorsublime-Themes/themes');

handlebars.registerHelper('json', (context) => {
  // return a pretty formatted JSON string
  return JSON.stringify(context, null, '  ');
});

const template = handlebars.compile(fs.readFileSync('template.hbs', 'utf8'));

const transformations = {
  'Comment': 'message',
  'Number': 'time',
  'Keyword': 'platform',
};

const destination = 'output';

if (!fs.existsSync(destination)){
    fs.mkdirSync(destination);
}

walker.on("file", (root, fileStats, next) => {
  fs.readFile(fileStats.name, function () {
    const file = `${root}/${fileStats.name}`;

    const theme = immutable.Map(plist.parse(fs.readFileSync(file, 'utf8')));
    const name = theme.get('name');
    const settings = theme.get('settings')[0].settings;
    
    const comment = theme.get('settings').filter(f => f.name === 'Comment');
    let output = {
      'background': settings.background,
    };
    for (const key in transformations) {
      const value = theme.get('settings').filter(obj => obj.name === key)[0];
      if (typeof value !== 'undefined') {
        output[transformations[key]] = value.settings.foreground;
      }
    }

    const data = {
      name: name,
      object: output,
    };
    fs.writeFile(`${destination}/${name}.js`, template(data));
    next();
  });
});
