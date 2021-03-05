/**
 * @fileOverview jwt功能代码
 * @name jwt.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const jwt = require('jsonwebtoken');
const { assign, set, get, invoke } = require('lodash');
const { middleware } = require('brick-koa-adataper');
const { ENGINE, provide } = require('brick-engine');
const { JWT, JWT_REFRESH } = require('./constants');

function verify(target, opts) {

  const { name, ...options } = assign({ name: 'default' }, opts);
  if (!target[JWT]) {
    target[JWT] = true;
    provide(target, { property: JWT, dep: { id: ENGINE, transform } });
  }
  middleware(target, factory(name, options, verifyMiddleware));
  return target;
}

function transform(engine) {
  return engine.config.jwt;
}


function factory(name, opts, mw) {

  return item => {
    const config = item.model[JWT] || {};
    if (!config) {
      return undefined;
    }
    const _opts = assign({}, config[name], opts);
    return mw(_opts);
  };
}

function verifyMiddleware(opts) {

  return async (ctx, next) => {

    const { key, publicKey, privateKey, secret, passthrough, ...options } = opts;
    let token, payload;
    try {
      if (ctx.header && ctx.header.authorization) {
        const [scheme, content] = ctx.header.authorization.trim().split(' ');
        if (!/^Bearer$/i.test(scheme)) {
          throw new Error('UnSupportSchema');
        }
        token = content;
        payload = jwt.verify(token, publicKey || secret, options);
        set(ctx.state, key, payload);
      }
    } catch (err) {
      if (passthrough) {
        if (err instanceof jwt.JsonWebTokenError) {
          payload = jwt.decode(token);
          set(ctx.state, key, payload);
        }
        set(ctx.state, passthrough, err);
      } else {
        ctx.throw(401, 'Unauthorized', err);
        return;
      }
    } finally {
      next();
    }
  };
}


exports.verify = verify;

function sign(target, opts) {
  const { name, ...options } = assign({ name: 'default' }, opts);
  if (!target[JWT]) {
    target[JWT] = true;
    provide(target, { property: JWT, dep: { id: ENGINE, transform } });
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

function refresh(target, opts) {
  const { id, path, name, ...options } = assign({ name: 'default' }, opts);
  if (!target[JWT]) {
    target[JWT] = true;
    provide(target, { property: JWT, dep: { id: ENGINE, transform } });
  }
  if (!target[JWT_REFRESH]) {
    target[JWT_REFRESH] = true;
    provide(target, { property: JWT_REFRESH, dep: { id, transform: refreshMethod.bind(this, path) } });
  }
  middleware(target, factory(name, options, refreshMiddleware));
  return target;
}

function refreshMethod(path, target) {
  return (payload) => invoke(target, path, payload);
}

function refreshMiddleware(opts, item) {
  const { key, passthrough, property, privateKey, secret, ..._opts } = opts;
  return (ctx, next) => {
    const payload = get(ctx.state, key);
    const error = get(ctx.state, passthrough);
    if (error && error instanceof jwt.JsonWebTokenError) {
      const _payload = item.model[JWT_REFRESH](payload);
      const token = jwt.sign(_payload, privateKey || secret, _opts);
      ctx.set('WWW-Authenticate', `Bearer ${token}`);
    }
    next();
  };
}

exports.refresh = refresh;
