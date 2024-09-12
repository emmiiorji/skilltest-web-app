import Handlebars from 'handlebars';

export function registerHandlebarsHelpers() {
  Handlebars.registerHelper('startsWith', function(str, prefix) {
    return str.startsWith(prefix);
  });

  Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
  });

  Handlebars.registerHelper('add', function(a, b) {
    return a + b;
  });

  Handlebars.registerHelper('subtract', function(a, b) {
    return a - b;
  });

  Handlebars.registerHelper('and', function() {
    return Array.prototype.every.call(arguments, Boolean);
  });
}