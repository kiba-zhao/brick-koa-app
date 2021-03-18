/**
 * @fileOverview 访问控制业务
 * @name acl.js
 * @author kiba.x.zhao <kiba.rain@qq.com>
 * @license MIT
 */
'use strict';

const { inject } = require('brick-engine');

class ACLService {

  async allow(payload) {
    return !!payload.acl;
  }
}

module.exports = ACLService;

inject(module.exports, { name: 'acl' });
