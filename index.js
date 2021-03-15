/**
 * @fileOverview 插件模块入口
 * @name index.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { verify: jwtVerify, sign: jwtSign } = require('./lib/jwt');
const { validate } = require('./lib/ajv');
const { acl } = require('./lib/acl');
const { rateLimit } = require('./lib/rateLimit');

exports.jwtVerify = jwtVerify;
exports.jwtSign = jwtSign;

exports.validate = validate;
exports.acl = acl;
exports.rateLimit = rateLimit;
