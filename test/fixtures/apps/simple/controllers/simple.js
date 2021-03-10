/**
 * @fileOverview 简单示例
 * @name simple.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { controller } = require('brick-koa-adapter');
const { jwtVerify, jwtSign } = require('../../../../..');

class Simple {

  post(ctx) {
    const payload = ctx.request.body;
    const token = ctx.jwt(payload);
    ctx.status = 201;
    ctx.body = { ...payload, token };
  }

  get(ctx) {
    const payload = ctx.state.jwt;
    ctx.status = 200;
    ctx.body = payload;
  }

  put(ctx) {
    const payload = ctx.state.jwt;
    ctx.body = payload;
  }

  patch(ctx) {
    const payload = ctx.state.jwt;
    ctx.body = payload;
  }
}

module.exports = Simple;

controller(module.exports, { path: '/simple' });
jwtSign(module.exports);
jwtVerify(module.exports, { properties: [ 'get' ] });
jwtVerify(module.exports, { name: 'simple', property: 'put' });
jwtVerify(module.exports, { name: 'simple', property: 'patch', passthrough: 'jwtError' });
