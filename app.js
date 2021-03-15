/**
 * @fileOverview 应用入口
 * @name app.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const jwt = require('./lib/jwt');
const ajv = require('./lib/ajv');
const acl = require('./lib/acl');
const rateLimit = require('./lib/rateLimit');

module.exports = engine => {

  jwt.setup(engine);
  ajv.setup(engine);
  acl.setup(engine);
  rateLimit.setup(engine);

  return engine;
};
