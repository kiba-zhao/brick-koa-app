/**
 * @fileOverview ajv数据格式验证功能
 * @name ajv.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const assert = require('assert');
const Ajv = require('ajv').default;
const { set, isString, isObject, isFunction } = require('lodash');
const { provide, inject } = require('brick-engine');
const { middleware } = require('brick-koa-adapter');
const { AJV } = require('./constants');

/**
 * ajv验证可选想
 * @typedef {Object} ValidateOpts
 * @property {String | Symbol} [name] schema名称
 * @property {Object} [schema] schema对象
 * @property {Object.<String|Symbol,String|Symbol|Object>} [schemas] schema字典对象
 * @property {String | Symbol} [property] 生效目标对象成员方法
 * @property {Array<String | Symbol>} [properties] 生效目标对象成员方法
 * @property {String | Symbol} [key] 验证结果注入到ctx.state的key
 */

/**
 * 验证注释方法
 * @param {Any} target 目标对象
 * @param {ValidateOpts} opts 验证可选想
 * @return {Any} 目标对象
 */
function validate(target, opts) {

  if (!target[AJV]) {
    target[AJV] = true;
    provide(target, { property: AJV, dep: AJV });
  }

  middleware(target, middlewareFactory.bind(this, opts));
  return target;
}

function middlewareFactory(opts, item, routeOpts) {

  const { key, property, properties, schemas } = opts;

  if (property !== undefined && property !== routeOpts.property) {
    return undefined;
  }
  if (properties !== undefined && !properties.includes(routeOpts.property)) {
    return undefined;
  }
  if (schemas !== undefined && !Reflect.ownKeys(schemas).includes(routeOpts.property)) {
    return undefined;
  }

  const ajv = item.model[AJV];
  assert(ajv instanceof Ajv, '[brick-koa-app ajv] validate Error: ajv instance not found');

  let { name, schema } = opts;
  if (!name && !schema && schemas) {
    if (isString(schemas[routeOpts.property])) {
      name = schemas[routeOpts.property];
    } else if (isObject(schemas[routeOpts.property])) {
      schema = schemas[routeOpts.property];
    }
  }

  let v;
  if (name) {
    v = ajv.getSchema(name);
  } else if (schema) {
    v = ajv.compile(schema);
  }

  assert(isFunction(v), '[brick-koa-app ajv] validate Error: validate schema not found');
  return async (ctx, next) => {
    // debugger;
    let errors,
      valid;
    if ('$async' in v) {
      try {
        valid = await v(ctx);
      } catch (e) {
        if (!(e instanceof Ajv.ValidationError)) throw e;
        errors = e.errors;
      }
    } else {
      valid = v(ctx);
      errors = v.errors;
    }

    if (errors) {
      ctx.throw(422, 'Unprocessable Entity', errors);
    }

    set(ctx.state, key, valid);
    await next();
  };
}


exports.validate = validate;

function setup(engine) {
  const { patterns, opts, ...options } = engine.config.ajv || {};
  if (patterns) {
    engine.build(patterns, Object.assign({ model: false }, opts), install.bind(this, engine, options));
  } else {
    install(engine, options);
  }
}

function install(engine, opts, targets) {
  const fn = factory.bind(this, targets, opts);
  inject(fn, { name: AJV });
  engine.install(fn);
}

function factory(targets, opts) {

  let ajv = new Ajv(opts);
  for (const target of targets) {
    const { name, model } = target;
    if (name && model) {
      ajv = ajv.addSchema(model, name);
    }
  }
  return ajv;
}

exports.setup = setup;
