import Handlebars from 'handlebars';

export function registerHandlebarsHelpers() {
  Handlebars.registerHelper('startsWith', function(str, prefix) {
    return str?.startsWith(prefix);
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

  Handlebars.registerHelper('countCorrectAnswers', function(answers) {
    return answers?.filter((answer: {isCorrect: boolean}) => answer.isCorrect).length;
  });
}