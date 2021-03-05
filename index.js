/**
 * @fileOverview 插件模块入口
 * @name index.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { verify: JWTVerify, refresh: JWTRefresh, sign: JWTSign } = require('./lib/jwt');

exports.JWTVerify = JWTVerify;
exports.JWTSign = JWTSign;
exports.JWTRefresh = JWTRefresh;
