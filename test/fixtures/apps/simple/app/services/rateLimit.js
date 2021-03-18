/**
 * @fileOverview 限流业务
 * @name limit.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { inject } = require('brick-engine');

class RetaLimitService {

  async allow(payload) {

    return !!payload.limit;
  }

}

module.exports = RetaLimitService;

inject(module.exports, { name: 'rateLimit' });
