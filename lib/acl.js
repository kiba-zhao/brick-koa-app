/**
 * @fileOverview 访问控制
 * @name acl.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const assert = require('assert');
const { get } = require('lodash');
const { provide, inject } = require('brick-engine');
const { middleware } = require('brick-koa-adapter');
const { ACL } = require('./constants');

/**
 * 访问控制注释可选项
 * @typedef {Object} ACLOpts
 * @property {String | Symbol} [name='default'] 配置名称
 * @property {String | Symbol} [property] 生效目标对象成员方法
 * @property {Array<String | Symbol>} [properties] 生效目标对象成员方法
 * @property {Object.<String | Symbol,String>} [payload] 业务函数参数的映射对象
 */

/**
 * 访问控制注释函数
 * @param {Any} target 目标对象
 * @param {ACLOpts} opts 可选项
 * @return {Any} 目标象对
 */
function acl(target, opts) {

  const options = Object.assign({ name: 'default' }, opts);
  if (!target[ACL]) {
    target[ACL] = true;
    provide(target, { property: ACL, dep: ACL });
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

  const configs = item.model[ACL];
  const { [ACL]: m, opts: _opts } = configs[name];
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
      ctx.throw(403, 'forbidden');
    }
    await next();
  };

}

exports.acl = acl;

function setup(engine) {
  const aclConfig = engine.config.acl;
  const keys = Reflect.ownKeys(aclConfig);
  const deps = [];
  for (const key of keys) {

    const { module } = aclConfig[key];
    assert(module, '[brick-koa-app acl] setup Error: miss module');
    if (module) {
      deps.push(module);
    }
  }

  const factory = install.bind(this, engine, keys);
  inject(factory, { name: ACL, deps });
  engine.install(factory);

  return engine;
}

function install(engine, keys, ...modules) {
  const aclConfig = engine.config.acl;
  const configs = {};
  let offset = 0;
  for (const key of keys) {
    const { module, ...opts } = aclConfig[key];
    if (module) {
      configs[key] = { opts, [ACL]: modules[offset] };
      offset++;
    } else {
      configs[key] = opts;
    }
  }
  return configs;
}

exports.setup = setup;
