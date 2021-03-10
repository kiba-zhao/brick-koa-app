/**
 * @fileOverview jwt验证业务
 * @name jwt.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { inject } = require('brick-engine');

class JWTService {

  async validate(payload) {
    const { userId } = payload || {};
    return !!userId;
  }

}

module.exports = JWTService;

inject(module.exports, { name: 'jwt' });
