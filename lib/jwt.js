/**
 * @fileOverview jwt功能代码
 * @name jwt.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const jwt = require('jsonwebtoken');
const { assign, set, isFunction } = require('lodash');
const { middleware } = require('brick-koa-adataper');
const { provide } = require('brick-engine');
const { JWT } = require('./constants');

function verify(target, opts) {

  const { name, ...options } = assign({ name: 'default' }, opts);
  if (!target[JWT]) {
    target[JWT] = true;
    provide(target, { property: JWT, dep: JWT });
  }
  middleware(target, factory(name, options, verifyMiddleware));
  return target;
}


function factory(name, opts, mw) {

  return item => {
    const configs = item.model[JWT] || {};
    const _opts = assign({}, configs[name], opts);
    return mw(_opts, configs[JWT]);
  };
}

function verifyMiddleware(opts, module) {

  const { refresh, verify } = module || {};
  return async (ctx, next) => {

    const { key, publicKey, privateKey, secret, ...options } = opts;
    let token, payload, error;
    try {
      if (ctx.header && ctx.header.authorization) {
        const [scheme, content] = ctx.header.authorization.trim().split(' ');
        if (!/^Bearer$/i.test(scheme)) {
          throw new Error('UnSupportSchema');
        }
        token = content;
        payload = jwt.verify(token, publicKey || secret, options);
      }
    } catch (err) {
      if (isFunction(refresh) && err instanceof jwt.JsonWebTokenError) {
        payload = jwt.decode(token);
        payload = await refresh(payload);
      }
      error = err;
    } finally {
      if (!payload) {
        ctx.throw(401, 'Unauthorized', error);
        return;
      }
      const valid = error || !isFunction(verify) ? true : await verify(payload);
      if (!valid) {
        ctx.throw(401, 'Unauthorized');
        return;
      }
      set(ctx.state, key, payload);
      next();
    }
  };
}


exports.verify = verify;

function sign(target, opts) {
  const { name, ...options } = assign({ name: 'default' }, opts);
  if (!target[JWT]) {
    target[JWT] = true;
    provide(target, { property: JWT, dep: JWT });
  }
  middleware(target, factory(name, options, signMethod));
  return target;
}

function signMethod(opts) {
  const { property, privateKey, secret, ..._opts } = opts;
  return (ctx, next) => {
    Object.defineProperty(ctx, property, {
      value: (payload, key, options = {}) => {
        const token = jwt.sign(payload, key || privateKey || secret, assign(options, _opts));
        ctx.set('WWW-Authenticate', `Bearer ${token}`);
      }
    });
    next();
  };
}

exports.sign = sign;
