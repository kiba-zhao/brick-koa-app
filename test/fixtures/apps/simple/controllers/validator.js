/**
 * @fileOverview 验证器示例
 * @name validator.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { controller } = require('brick-koa-adapter');
const { validate } = require('../../../../..');

const Schema = {};

class Validator {

  async get(ctx) {

  }

  async post(ctx) {

  }

  async put(ctx) {

  }

  async delete(ctx) {
  }
}

module.exports = Validator;

controller(module.exports, { path: '/validator' });
validate(module.exports, { name: 'simple1', property: 'get' });
validate(module.exports, { schema: Schema, properties: ['post'] });
validate(module.exports, { schemas: { delete: 'simple1', put: Schema } });
