/**
 * @fileOverview 默认配置
 * @name default.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

exports.jwt = {
  default: { key: 'jwt', secret: 'asdf123', signOpts: { expiresIn: 5 * 60 }, verifyOpts: { maxAge: 5 * 60 } },
  simple: { key: 'jwt', secret: '123asdf', signOpts: { expiresIn: 5 * 60 } },
};
