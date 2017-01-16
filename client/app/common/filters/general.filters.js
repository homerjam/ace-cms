import angular from 'angular';
import moment from 'moment';
import filesize from 'filesize';
import _ from 'lodash';
import he from 'he/he';
import sanitizeHtml from 'sanitize-html';

const generalFilters = angular.module('generalFilters', []);

export default generalFilters;

generalFilters

  .filter('encodeURI', ($window) => {
    'ngInject';

    return input => $window.encodeURI(input);
  })

  .filter('encodeURIComponent', ($window) => {
    'ngInject';

    return input => $window.encodeURIComponent(input);
  })

  .filter('fromNow', () => date => moment(date).fromNow())

  .filter('pad', () => (n, l, z) => {
    z = z || '0';
    l = l || 2;
    n = `${n}`;
    return n.length >= l ? n : new Array((l - n.length) + 1).join(z) + n;
  })

  .filter('if', () => (input, trueValue, falseValue) => input ? trueValue : falseValue)

  .filter('deZero', () => input => input + 1)

  .filter('floor', () => input => Math.floor(input))

  .filter('simplifyText', () => (input) => {
    if (!input) {
      return '';
    }
    input = input.replace(/<\/(p|h1|h2|h3|h4|h5|h6)\b[^>]*>/gi, '&#13;&#10').replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, ' ').replace(/\s{2,}/g, ' ');
    input = input.replace(/&#13;&#10[^$]/gi, '<br>');
    return input;
  })

  .filter('stripTags', () => (input, allowed) => {
    if (!input) {
      return '';
    }
    allowed = ((`${allowed || ''}`).toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, ($0, $1) => allowed.indexOf(`<${$1.toLowerCase()}>`) > -1 ? $0 : '');
  })

  .filter('truncateWords', () => (input, wordCount) => {
    if (!input) {
      return '';
    }
    const words = input.split(' ');
    if (words.length <= wordCount) {
      return input;
    }
    return `${words.slice(0, wordCount).join(' ')}…`;
  })

  .filter('scotify', () => (input) => {
    let name = String(input);

    if (/^mc(.*)$/i.test(name)) {
      name = `${name.substr(0, 1)}<span class="lowercase">${name.substr(1, 1)}</span>${name.substr(2)}`;
    }

    return name;
  })

  .filter('spanDescendersInLinks', ['$sce',
    $sce => (input) => {
      const links = input.match(/(?=<a)[^]+?>(.+?)<\/a>/g);

      angular.forEach(links, (link) => {
        const originalText = link.match(/>(.+)</)[1];
        const newText = originalText.replace(/(g|j|p|q|y)/g, '<span data-content="$1">$1</span>');

        input = input.replace(originalText, newText);
      });

      return $sce.trustAsHtml(input);
    },
  ])

  .filter('pluralize', () => (input) => {
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
  })

  .filter('camelCase', () => input => input.replace(/-\w/g, match => match[1].toUpperCase()))

  .filter('fileSize', () => (input) => {
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
  })

  .filter('propInArray', () => (input, prop, arr) => input.filter(obj => arr.indexOf(obj[prop]) !== -1))

  .filter('trimify', () => input => input.replace(/^(-|–|—|\/|:|\s)+/, '').replace(/(-|–|—|\/|:|\s)+$/, ''))

  .filter('toTitleCase', () => (input) => {
    if (!input) {
      return input;
    }

    return input.replace(/\w\S*/g, (str) => {
      if (/^(and|of)$/i.test(str)) {
        return str.toLowerCase();
      }
      return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
    });
  })

  .filter('toFixed', () => (input, len) => {
    len = len !== undefined ? len : 2;

    if (input === undefined) {
      return input;
    }

    if (typeof input !== 'number') {
      input = Number(input);
    }

    return input.toFixed(len);
  })

  .filter('booleanify', () => (input) => {
    let result = false;

    if (input === true || input === 'true' || input === 1 || input === '1') {
      result = true;
    }

    return result;
  })

  .filter('parseDate', ($filter) => {
    'ngInject';

    return (input, format = 'short') => {
      if (!input) {
        return '-';
      }
      return $filter('date')(Date.parse(input), format);
    };
  })

  .filter('decodeEntities', () => input => he.decode(input))

  .filter('cleanHTML', () => (input, pasted = false) => {
    let clean = sanitizeHtml(input, {
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
  })

  .filter('propsFilter', () => (items, props) => {
    if (_.isArray(items)) {
      const matches = [];

      items.forEach((item) => {
        let itemMatches = false;

        const keys = Object.keys(props);
        for (let i = 0; i < keys.length; i++) {
          const prop = keys[i];
          const text = props[prop].toLowerCase();
          if (item[prop] && item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          matches.push(item);
        }
      });

      return matches;
    }

    return items;
  });
