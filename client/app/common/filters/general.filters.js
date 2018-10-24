import angular from 'angular';
import moment from 'moment';
import filesize from 'filesize';
import _ from 'lodash';
import he from 'he/he';
import sanitizeHtml from 'sanitize-html';

const generalFilters = angular.module('generalFilters', []);

generalFilters.filter('encodeURI', ($window) => {
  'ngInject';

  return input => $window.encodeURI(input);
});

generalFilters.filter('encodeURIComponent', ($window) => {
  'ngInject';

  return input => $window.encodeURIComponent(input);
});

generalFilters.filter('fromNow', () => date => moment(date).fromNow());

generalFilters.filter('pad', () => (n, l, z) => {
  z = z || '0';
  l = l || 2;
  n = `${n}`;
  return n.length >= l ? n : new Array((l - n.length) + 1).join(z) + n;
});

generalFilters.filter('simplifyText', () => (input) => {
  if (!input) {
    return '';
  }
  input = input.replace(/<\/(p|h1|h2|h3|h4|h5|h6)\b[^>]*>/gi, '&#13;&#10').replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, ' ').replace(/\s{2,}/g, ' ');
  input = input.replace(/&#13;&#10[^$]/gi, '<br>');
  return input;
});

generalFilters.filter('stripTags', () => (input, allowed) => {
  if (!input) {
    return '';
  }
  allowed = ((`${allowed || ''}`).toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '').replace(tags, ($0, $1) => (allowed.indexOf(`<${$1.toLowerCase()}>`) > -1 ? $0 : ''));
});

generalFilters.filter('truncateWords', () => (input, wordCount) => {
  if (!input) {
    return '';
  }
  const words = input.split(' ');
  if (words.length <= wordCount) {
    return input;
  }
  return `${words.slice(0, wordCount).join(' ')}…`;
});

generalFilters.filter('pluralize', () => (input) => {
  if (!input) {
    return '';
  }
  let plural = input;
  if (input.substr(input.length - 2) === 'us') {
    plural = `${plural.substr(0, plural.length - 2)}i`;
  } else if (input.substr(input.length - 2) === 'ch' || input.charAt(input.length - 1) === 'x' || input.charAt(input.length - 1) === 's') {
    plural += 'es';
  } else if (input.charAt(input.length - 1) === 'y' && ['a', 'e', 'i', 'o', 'u'].indexOf(input.charAt(input.length - 2)) === -1) {
    plural = `${plural.substr(0, plural.length - 1)}ies`;
  } else if (input.substr(input.length - 2) === 'is') {
    plural = `${plural.substr(0, plural.length - 2)}es`;
  } else {
    plural += 's';
  }
  return plural;
});

generalFilters.filter('camelCase', () => input => input.replace(/-\w/g, match => match[1].toUpperCase()));

generalFilters.filter('fileSize', () => (input) => {
  let size = 0;
  if (!input) {
    return size;
  }
  try {
    size = filesize(input);
  } catch (error) {
    //
  }
  return size;
});

generalFilters.filter('trimify', () => input => input.replace(/^(-|–|—|\/|:|\s)+/, '').replace(/(-|–|—|\/|:|\s)+$/, ''));

generalFilters.filter('toTitleCase', () => (input) => {
  if (!input) {
    return input;
  }

  return input.replace(/\w\S*/g, (str) => {
    if (/^(and|of)$/i.test(str)) {
      return str.toLowerCase();
    }
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
  });
});

generalFilters.filter('toFixed', () => (input, len) => {
  len = len !== undefined ? len : 2;

  if (input === undefined) {
    return input;
  }

  if (typeof input !== 'number') {
    input = Number(input);
  }

  return input.toFixed(len);
});

generalFilters.filter('parseDate', ($filter) => {
  'ngInject';

  return (input, format = 'short') => {
    if (!input) {
      return '-';
    }
    return $filter('date')(Date.parse(input), format);
  };
});

generalFilters.filter('decodeEntities', () => input => he.decode(input));

generalFilters.filter('cleanHTML', () => (input, pasted = false) => {
  let clean = sanitizeHtml(`<p>${input}</p>`, {
    allowedTags: [
      'p', 'a',
      'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'caption', 'strike', 'code', 'pre',
      'ul', 'ol', 'li',
      'u', 'b', 'i', 'strong', 'em',
      'sub', 'sup',
      'hr', 'br',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'entity',
    ],
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel', 'urn'],
    parser: {
      lowerCaseTags: true,
    },
    transformTags: {
      a(tagName, attribs) {
        const absoluteUrl = /https?:\/\//.test(attribs.href);

        const newTag = {
          tagName,
          attribs: {
            href: attribs.href || '',
          },
        };

        if (absoluteUrl) {
          newTag.attribs.target = '_blank';
        }

        return newTag;
      },
    },
    exclusiveFilter: frame => /^(a|p)$/.test(frame.tag) && !frame.text.trim(),
  });

  if (pasted) {
    clean = clean.replace(/&nbsp;/gi, ' ');
  }

  return clean;
});

export default generalFilters;
