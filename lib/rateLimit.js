/**
 * @fileOverview 限流功能
 * @name rateLimit.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const assert = require('assert');
const { get } = require('lodash');
const { provide, inject } = require('brick-engine');
const { RATE_LIMIT } = require('./constants');
const { middleware } = require('brick-koa-adapter');

/**
 * 限流注释可选项
 * @typedef {Object} RateLimitOpts
 * @property {String | Symbol} [name='default'] 配置名称
 * @property {String | Symbol} [property] 生效目标对象成员方法
 * @property {Array<String | Symbol>} [properties] 生效目标对象成员方法
 * @property {Object.<String | Symbol,String>} [payload] 业务函数参数的映射对象
 */

/**
 * 限流注释函数
 * @param {Any} target 目标对象
 * @param {RateLimitOpts} opts 可选项
 * @return {Any} 目标对象
 */
function rateLimit(target, opts) {

  const options = Object.assign({ name: 'default' }, opts);
  if (!target[RATE_LIMIT]) {
    target[RATE_LIMIT] = true;
    provide(target, { property: RATE_LIMIT, dep: RATE_LIMIT });
  }

  middleware(target, middlewareFactory.bind(this, options));
  return target;
}

function middlewareFactory(opts, item, routeOpts) {

  const { name, property, properties, ...options } = opts;
  if (property !== undefined && property !== routeOpts.property) {
    return undefined;
  }
  if (properties !== undefined && !properties.includes(routeOpts.property)) {
    return undefined;
  }

  const configs = item.model[RATE_LIMIT];
  const { [RATE_LIMIT]: m, opts: _opts } = configs[name];
  const { payload, ..._options } = Object.assign(options, _opts);
  const keys = Reflect.ownKeys(payload);

  return async (ctx, next) => {

    let _payload;
    if (keys.length <= 0) {
      _payload = ctx;
    } else {
      _payload = {};
      for (const key of keys) {
        const path = payload[key];
        _payload[key] = get(ctx, path);
      }
    }

    const isAllowed = await m.allow(_payload, _options);
    if (!isAllowed) {
      ctx.throw(429, 'too many requests');
    }
    await next();
  };

}

exports.rateLimit = rateLimit;

function setup(engine) {
  const retaLimitConfig = engine.config.rateLimit;
  const keys = Reflect.ownKeys(retaLimitConfig);
  const deps = [];
  for (const key of keys) {

    const { module } = retaLimitConfig[key];
    assert(module, '[brick-koa-app limit] setup Error: miss module');
    if (module) {
      deps.push(module);
    }
  }

  const factory = install.bind(this, engine, keys);
  inject(factory, { name: RATE_LIMIT, deps });
  engine.install(factory);

  return engine;
}

function install(engine, keys, ...modules) {
  const retaLimitConfig = engine.config.rateLimit;
  const configs = {};
  let offset = 0;
  for (const key of keys) {
    const { module, ...opts } = retaLimitConfig[key];
    if (module) {
      configs[key] = { opts, [RATE_LIMIT]: modules[offset] };
      offset++;
    } else {
      configs[key] = opts;
    }
  }
  return configs;
}

exports.setup = setup;

