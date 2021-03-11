/**
 * @fileOverview 示例
 * @name simple.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { inject } = require('brick-engine');

module.exports = {
  $schema: 'http://json-schema.org/schema#',
  $id: 'simple',
  definitions: {
    code: {
      type: 'string',
      pattern: '^\\S+$',
    },
  },
  title: 'simple schema',
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        code: { $ref: '#/definitions/code' },
      },
    },
  },
};

inject(module.exports, { name: 'simple1' });
