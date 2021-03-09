/**
 * @fileOverview jwt功能代码
 * @name jwt.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const jwt = require('jsonwebtoken');
const { assign, set } = require('lodash');
const { middleware } = require('brick-koa-adapter');
const { provide, ENGINE } = require('brick-engine');
const { JWT } = require('./constants');

const UnSupportedError = new Error('UnSupported');
const UnAuthorizateError = new Error('UnAuthorizate');

function verify(target, opts) {

  const options = assign({ name: 'default' }, opts);
  if (!target[JWT]) {
    target[JWT] = true;
    provide(target, { property: JWT, dep: { id: ENGINE, required: true, transform } });
  }
  middleware(target, extension(options, verifyMiddleware));
  return target;
}

function transform(engine) {
  return engine.config.jwt;
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
    const _opts = assign({}, configs[name], options);
    return mw(_opts);
  };
}

function verifyMiddleware(opts) {

  return async (ctx, next) => {
    const { key, passthrough, decode, publicKey, secret, verifyOpts } = opts;
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
      error = err;
      if (passthrough) {
        set(ctx.state, passthrough, error);
      }
    }

    if (!passthrough && error) {
      ctx.set('WWW-Authenticate', 'Bearer');
      ctx.throw(401, 'Unauthorized', error);
    }

    if (decode && error instanceof jwt.TokenExpiredError) {
      payload = jwt.decode(token, verifyOpts);
    }

    if (payload) {
      set(ctx.state, key, payload);
    }

    await next();
  };
}


exports.verify = verify;

function sign(target, opts) {
  const options = assign({ name: 'default' }, opts);
  if (!target[JWT]) {
    target[JWT] = true;
    provide(target, { property: JWT, dep: { id: ENGINE, required: true, transform } });
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
