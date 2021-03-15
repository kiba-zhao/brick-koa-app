/**
 * @fileOverview jwt功能代码
 * @name jwt.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const jwt = require('jsonwebtoken');
const assert = require('assert');
const { assign, set, isArray, isFunction, isString, isSymbol, isUndefined } = require('lodash');
const { middleware } = require('brick-koa-adapter');
const { provide, inject } = require('brick-engine');
const { JWT } = require('./constants');

const UnSupportedError = new Error('UnSupported');
const UnAuthorizateError = new Error('UnAuthorizate');
const InValidError = new Error('InValidError');

/**
 * jwt验证可选项
 * @typedef {Object} VerifyOpts
 * @property {String | Symbol} [name='default'] 配置名称
 * @property {String | Symbol} [property] 生效目标对象成员方法
 * @property {Array<String | Symbol>} [properties] 生效目标对象成员方法
 * @property {String | Symbol} [key] payload注入到ctx.state的key
 * @property {String | Symbol} [passthrough] 验证异常注入到ctx.state的key
 * @property {String} [secret] 验证密钥
 * @property {String | Buffer} [publicKey] 验证公钥
 * @property {Object} [verifyOpts] 验证可选项，详细请参考jsonwebtoken中verify方法参数说明
 */

/**
 * jwt验证注释
 * @param {Any} target 目标对象
 * @param {VerifyOpts} opts jwt验证可选项
 * @return {Any} 目标对象
 */
function verify(target, opts) {

  const options = assign({ name: 'default' }, opts);

  assert(isString(options.name) || isSymbol(options.name), '[brick-koa-app:jwt] verify Error: wrong opts.name');
  assert(isUndefined(options.property) || isString(options.property) || isSymbol(options.property), '[brick-koa-app:jwt] verify Error: wrong opts.property');
  assert(isUndefined(options.properties) || (isArray(options.properties) && options.properties.every(_ => isString(_) || isSymbol(_))), '[brick-koa-app:jwt] verify Error: wrong opts.properties');

  if (!target[JWT]) {
    target[JWT] = true;
    provide(target, { property: JWT, dep: JWT });
  }
  middleware(target, extension(options, verifyMiddleware));
  return target;
}


function extension(opts, mw) {
  const { name, property, properties, ...options } = opts;

  return (item, routeOpts) => {
    if (property !== undefined && property !== routeOpts.property) {
      return undefined;
    }
    if (properties !== undefined && !properties.includes(routeOpts.property)) {
      return undefined;
    }
    const configs = item.model[JWT] || {};
    const _opts = Object.assign({}, configs[name], options);
    return mw(_opts);
  };
}

function verifyMiddleware(opts) {

  return async (ctx, next) => {
    const { key, passthrough, publicKey, secret, verifyOpts, [JWT]: module } = opts;
    let token,
      payload,
      error;
    try {
      if (ctx.header && ctx.header.authorization) {
        const [ scheme, content ] = ctx.header.authorization.trim().split(' ');
        if (!/^Bearer$/i.test(scheme)) {
          throw UnSupportedError;
        }
        token = content;
        payload = jwt.verify(token, publicKey || secret, verifyOpts);
      } else {
        throw UnAuthorizateError;
      }
    } catch (err) {
      if (passthrough && err instanceof jwt.TokenExpiredError) {
        payload = jwt.decode(token, verifyOpts);
      }
      error = err;
    }

    const vali = payload && module && isFunction(module.validate) ? await module.validate(payload) : true;
    if (!vali) {
      error = InValidError;
    }

    if (!passthrough && error) {
      ctx.set('WWW-Authenticate', 'Bearer');
      ctx.throw(401, 'unauthorized', error);
    }

    set(ctx.state, passthrough, error);
    set(ctx.state, key, payload);
    await next();
  };
}


exports.verify = verify;

/**
 * jwt签名可选项
 * @typedef {Object} SignOpts
 * @property {String | Symbol} [name='default'] 配置名称
 * @property {String | Symbol} [property] 生效目标对象成员方法
 * @property {Array<String | Symbol>} [properties] 生效目标对象成员方法
 * @property {String | Symbol} [key] 签名函数注入到ctx上的方法名称
 * @property {String} [secret] 签名密钥
 * @property {String | Buffer} [privateKey] 签名私钥
 * @property {Object} [signOpts] 签名可选项，详细请参考jsonwebtoken中sign方法参数说明
 */

/**
 * jwt签名注释
 * @param {Any} target 目标对象
 * @param {SignOpts} opts jwt可选项
 * @return {Any} 目标对象
 */
function sign(target, opts) {

  const options = assign({ name: 'default' }, opts);

  assert(isString(options.name) || isSymbol(options.name), '[brick-koa-app:jwt] sign Error: wrong opts.name');
  assert(isUndefined(options.property) || isString(options.property) || isSymbol(options.property), '[brick-koa-app:jwt] sign Error: wrong opts.property');
  assert(isUndefined(options.properties) || (isArray(options.properties) && options.properties.every(_ => isString(_) || isSymbol(_))), '[brick-koa-app:jwt] sign Error: wrong opts.properties');

  if (!target[JWT]) {
    target[JWT] = true;
    provide(target, { property: JWT, dep: JWT });
  }

  middleware(target, extension(options, signMethod));
  return target;
}

function signMethod(opts) {
  const { key: property, privateKey, secret, signOpts } = opts;
  return async (ctx, next) => {
    Object.defineProperty(ctx, property, {
      enumerable: false,
      value: (payload, key, options = {}) => {
        const token = jwt.sign(payload, key || privateKey || secret, assign(options, signOpts));
        return token;
      },
    });
    await next();
  };
}

exports.sign = sign;

function setup(engine) {
  const jwtConfig = engine.config.jwt;
  const keys = Reflect.ownKeys(jwtConfig);
  const deps = [];
  for (const key of keys) {
    const config = jwtConfig[key];
    if (config.module) {
      deps.push(config.module);
    }
  }
  const factory = install.bind(this, engine, keys);
  inject(factory, { name: JWT, deps });
  engine.install(factory);
}

function install(engine, keys, ...modules) {
  const jwtConfig = engine.config.jwt;
  const configs = {};
  let offset = 0;
  for (const key of keys) {
    const { module, ...opts } = jwtConfig[key];
    if (module) {
      configs[key] = { ...opts, [JWT]: modules[offset] };
      offset++;
    } else {
      configs[key] = opts;
    }
  }
  return configs;
}

exports.setup = setup;
