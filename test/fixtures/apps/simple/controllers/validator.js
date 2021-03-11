/**
 * @fileOverview 验证器示例
 * @name validator.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { controller } = require('brick-koa-adapter');
const { validate } = require('../../../../..');

const Schema = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  properties: {
    request: {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            code: { $ref: 'simple#/definitions/code' },
          },
          required: [ 'code' ],
        },
      },
    },
  },
};

class Validator {

  async get(ctx) {
    const { query } = ctx;
    ctx.body = { query, method: 'get' };
    ctx.status = 200;
  }

  async post(ctx) {
    ctx.body = { body: ctx.request.body, method: 'post' };
    ctx.status = 201;
  }

  async put(ctx) {
    ctx.body = { body: ctx.request.body, method: 'put' };
    ctx.status = 200;
  }

  async delete(ctx) {
    ctx.status = 204;
  }
}

module.exports = Validator;

controller(module.exports, { path: '/validator' });
validate(module.exports, { name: 'simple1', property: 'get' });
validate(module.exports, { schema: Schema, properties: [ 'post' ] });
validate(module.exports, { schemas: { delete: 'simple1', put: Schema } });
