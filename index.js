/**
 * @fileOverview 插件模块入口
 * @name index.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { verify: jwtVerify, sign: jwtSign } = require('./lib/jwt');

exports.jwtVerify = jwtVerify;
exports.jwtSign = jwtSign;
