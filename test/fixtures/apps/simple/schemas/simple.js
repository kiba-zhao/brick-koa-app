/**
 * @fileOverview 示例
 * @name simple.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { inject } = require('brick-engine');

module.exports = {
  $schema: "http://json-schema.org/schema#",
  title: "simple schema",
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern: "^[A-Fa-f0-9]{24,24}$"
    }
  }
};

inject(module.exports, { name: 'simple1' });
