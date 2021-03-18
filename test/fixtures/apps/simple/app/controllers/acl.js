/**
 * @fileOverview 访问控制示例
 * @name acl.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { controller } = require('brick-koa-adapter');
const { acl } = require('../../../../../..');

class ACL {

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

module.exports = ACL;

controller(module.exports, { path: '/acl' });
acl(module.exports, { property: 'get', payload: { acl: 'query.acl' } });
acl(module.exports, { properties: [ 'post' ], payload: { acl: 'request.body.acl' } });
