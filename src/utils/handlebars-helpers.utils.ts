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

  Handlebars.registerHelper('or', function() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    console.debug('args', args);
    return args.some(arg => arg);
  });

  Handlebars.registerHelper('parseJson', function(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  });

  Handlebars.registerHelper('stringifyJson', function(obj) {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      console.error('Error stringifying object:', error);
      return '';
    }
  });

  Handlebars.registerHelper('formatDate', function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  });
  
  Handlebars.registerHelper('splitQuestionDetails', function(details) {
    return details.split(', ');
  });

  Handlebars.registerHelper('splitQuery', function(url) {
    const queryString = url.split('?')[1];
    if (!queryString) return {};
    
    return queryString.split('&').reduce((params: Record<string, string>, param: string) => {
      const [key, value]: string[] = param.split('=');
      if(!key || !value) {
        throw new Error('Invalid query string');
      }
      params[decodeURIComponent(key)] = decodeURIComponent(value);
      return params;
    }, {});
  });
}

export const helpers = {
  add: (a: number, b: number) => a + b,
};