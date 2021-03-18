/**
 * @fileOverview 限流示例
 * @name rateLimit.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { controller } = require('brick-koa-adapter');
const { rateLimit } = require('../../../../../..');

class RateLimit {

  get(ctx) {
    const { query } = ctx;
    ctx.body = { query, method: 'get' };
    ctx.status = 200;
  }

  post(ctx) {
    ctx.body = { body: ctx.request.body, method: 'post' };
    ctx.status = 201;
  }

}

module.exports = RateLimit;

controller(module.exports, { path: '/rate-limit' });
rateLimit(module.exports, { property: 'get', payload: { limit: 'query.limit' } });
rateLimit(module.exports, { properties: [ 'post' ], payload: { limit: 'request.body.limit' } });
