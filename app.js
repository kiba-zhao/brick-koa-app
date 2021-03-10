/**
 * @fileOverview 应用入口
 * @name app.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const jwt = require('./lib/jwt');
const ajv = require('./lib/ajv');

module.exports = engine => {
  jwt.setup(engine);
  ajv.setup(engine);
  return engine;
};
