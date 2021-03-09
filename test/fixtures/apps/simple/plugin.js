/**
 * @fileOverview 插件设置
 * @name plugin.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const path = require('path');

exports.koaAdapter = {
  package: 'brick-koa-adapter',
};

exports.koaApp = {
  package: path.join(__dirname, '..', '..', '..', '..'),
};
