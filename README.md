# brick-koa-app #
利用[brick-engine](https://github.com/kiba-zhao/brick-engine)构建koa应用所需要的基本功能插件包.提供jwt认证,validator数据格式验证等功能.

> 依赖于[brick-koa-adapter](https://github.com/kiba-zhao/brick-koa-adapter)koa框架适配插件

## Install ##

``` shell
npm install --save brick-koa-app

```

## Usage ##
设置plugin.js，注册启用插件

``` javascript
// {cwd}/plugin.js
// {cwd}/node_modules/{xxx engine}/plugin.js

exports.adapterKoa = {
    package:'brick-koa-app'
};
```

### JWT认证 ###
jwt认证是目前比较流行的web认证方式,brick-koa-app通过给[brick-koa-adapter](https://github.com/kiba-zhao/brick-koa-adapter)中router注入的controller对象,添加JWTVerify或JWTSign来声明jwt验证和签名功能．

#### 配置 ####

``` javascript
// {cwd}/config/*.js
// {cwd}/node_modules/{xxx engine}/config/*.js
// {cwd}/node_modules/{xxx plugin}/config/*.js

exports.jwt = {
    default: { 
        // sign注入到ctx的方法名，或verify验证成功后将payload注入到ctx.state的属性名
        key: 'jwt', 
        // 验证失败后,将error对象注入到ctx.state的属性名
        passthrough:'jwtError',
        // 加密密钥
        secret: 'asdf123', 
        // 加密公钥
        publicKey:'dasd',
        // 解密私钥
        privateKey:'dasd',
        // jsonwebtoken.sign可选项
        signOpts: { expiresIn: 5 * 60 }, 
        // jsonwebtoken.verify可选项
        verifyOpts: { maxAge: 5 * 60 },
        // payload附加检查模块对象依赖信息
        module: { id: 'services', required: true, transform: _ => _.jwt },
    }
  },
};
```

#### 示例 ####

``` javascript
// {cwd}/controllers/*.js
// {cwd}/node_modules/{xxx engine}/app/controllers/*.js
// {cwd}/node_modules/{xxx plugin}/app/controllers/*.js

const { controller } = require('brick-koa-adapter');
const { JWTVerify,JWTSign } = require('brick-koa-app');

class Simple {

  post(ctx) {
    const payload = ctx.request.body;
    const token = ctx.jwt(payload);
    ctx.status = 201;
    ctx.body = { ...payload, token };
  }

  get(ctx) {
    const payload = ctx.state.jwt;
    ctx.status = 200;
    ctx.body = payload;
  }

  put(ctx) {
    const payload = ctx.state.jwt;
    ctx.body = payload;
  }

  patch(ctx) {
    const payload = ctx.state.jwt;
    ctx.body = payload;
  }
}

module.exports = Simple;

controller(module.exports, { path: '/simple' });

// 给所有方法注入jwt.sign方法: ctx.jwt
jwtSign(module.exports);

// 在get方法前使用jsonwebtoken.verify进行验证,使用config.jwt.default配置,验证失败返回401响应
jwtVerify(module.exports, { properties: [ 'get' ] });

// 在put方法前使用jsonwebtoken.verify进行验证,使用config.jwt.simple配置,验证失败返回401响应
jwtVerify(module.exports, { name: 'simple', property: 'put' });

// 在patch方法前使用jsonwebtoken.verify进行验证,使用config.jwt.simple配置,验证失败将异常注入ctx.state.jwtError
jwtVerify(module.exports, { name: 'simple', property: 'patch', passthrough: 'jwtError' });
```

##### jwtSign(target,opts) #####
jwt签名注释．注释功能会给ctx增加sign函数.

**target**
路由功能对象的构建方法

**opts**
签名可选项参数

* opts.name {String | Symbol}: 配置名称,默认为default
* opts.property {String | Symbol}: 生效目标对象成员方法
* opts.properties {Array<String | Symbol>}: 生效目标对象成员方法
* opts.key {String | Symbol}: 签名函数注入到ctx上的方法名称
* opts.secret {String}: 签名密钥
* opts.privateKey {String | Buffer}: 签名密钥
* opts.signOpts {Object}: 签名可选项，详细请参考jsonwebtoken中sign方法参数说明

##### jwtVerify(target,opts) #####
jwt验证注释.验证http header中Authorization,验证失败或异常http status返回401.

**target**
路由功能对象的构建方法

**opts**
验证token可选项参数

* opts.name {String | Symbol}: 配置名称,默认为default
* opts.property {String | Symbol}: 生效目标对象成员方法
* opts.properties {Array<String | Symbol>}: 生效目标对象成员方法
* opts.key {String | Symbol}: payload注入到ctx.state上的属性名
* opts.passthrough {String | Symbol}: error注入到ctx.state上的属性名
* opts.secret {String}: 验证密钥
* opts.publicKey {String | Buffer}: 验证密钥
* opts.verifyOpts {Object}: 验证可选项，详细请参考jsonwebtoken中verify方法参数说明

#### 附加模块 ####
jwt一般只对token有效性进行验证,例如在过期前作废的token,就需要额外的检查功能来实现．

```javascript
// {cwd}/services/*.js
// {cwd}/node_modules/{xxx engine}/app/services/*.js
// {cwd}/node_modules/{xxx plugin}/app/services/*.js

const { inject } = require('brick-engine');

class JWTService {

  async validate(payload) {
    const { userId } = payload || {};
    return !!userId;
  }

}

module.exports = JWTService;

inject(module.exports, { name: 'jwt' });

```

### validate格式检查 ###
[ajv](https://github.com/ajv-validator/ajv)是使用json schema的数据验证工具．brick-koa-app提供注解方法,实现web的请求内容验证.

#### 配置 ####

``` javascript
// {cwd}/config/*.js
// {cwd}/node_modules/{xxx engine}/config/*.js
// {cwd}/node_modules/{xxx plugin}/config/*.js

exports.ajv = {
    // json schema文件模块匹配
    patterns: 'schemas/**/*.js',
    // 文件模块可选项
    opts:{},
    // ajv对象构建参数,详细请参考ajv文档
    ...
};
```

#### 示例 ####

``` javascript
// {cwd}/controllers/*.js
// {cwd}/node_modules/{xxx engine}/app/controllers/*.js
// {cwd}/node_modules/{xxx plugin}/app/controllers/*.js

const { controller } = require('brick-koa-adapter');
const { validate } = require('brick-koa-app');

const Schema = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  properties: {
    request: {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            code: { $ref: 'simple#/definitions/code' },
          },
          required: ['code'],
        },
      },
    },
  },
};

class Validator {

  async get(ctx) {
    const { query } = ctx;
    ctx.body = { query, method: 'get' };
    ctx.status = 200;
  }

  async post(ctx) {
    ctx.body = { body: ctx.request.body, method: 'post' };
    ctx.status = 201;
  }

  async put(ctx) {
    const { query } = ctx;
    ctx.body = { body: ctx.request.body, method: 'put' };
    ctx.status = 200;
  }

  async delete(ctx) {
    ctx.status = 204;
  }
}

module.exports = Validator;

controller(module.exports, { path: '/validator' });

//　给get方法添加请求内容验证
validate(module.exports, { name: 'simple1', property: 'get' });
//　给post方法添加请求内容验证
validate(module.exports, { schema: Schema, properties: ['post'] });
//　给delete,put方法添加请求内容验证
validate(module.exports, { schemas: { delete: 'simple1', put: Schema } });

```

#### validate(target,opts) ####
数据格式验证注释函数，验证失败http status返回422.

**target**
路由功能对象的构建方法

**opts**
请求验证可选项参数

* opts.name {String | Symbol}: schema文件注入的名字
* opts.schema {Object}: schema对象
* opts.schemas {Object.<String | Symbol,String | Symbol|Object>}: schema字典对象,key与target对象的成员函数匹配
* opts.property {String | Symbol}: 生效目标对象成员方法
* opts.properties {Array<String | Symbol>}: 生效目标对象成员方法
* opts.key {String | Symbol}: 验证结果注入到ctx.state上的属性名称

### ACL ###
根据业务模块处理的结果，进行访问控制.不允许访问http status返回403.

#### 配置 ####

``` javascript
// {cwd}/config/*.js
// {cwd}/node_modules/{xxx engine}/config/*.js
// {cwd}/node_modules/{xxx plugin}/config/*.js

exports.acl = {
    default:{
        // 业务模块依赖信息
        module: { id: 'services', required: true, transform: _ => _.acl },
        // 业务模块可选参数
        ...
    }
};
```

#### 示例 ####

``` javascript
// {cwd}/controllers/*.js
// {cwd}/node_modules/{xxx engine}/controllers/*.js
// {cwd}/node_modules/{xxx plugin}/controllers/*.js

const { controller } = require('brick-koa-adapter');
const { acl } = require('brick-koa-app');

class Simple {

  post(ctx) {
    const payload = ctx.request.body;
    const token = ctx.jwt(payload);
    ctx.status = 201;
    ctx.body = { ...payload, token };
  }

  get(ctx) {
    const payload = ctx.state.jwt;
    ctx.status = 200;
    ctx.body = payload;
  }
}

module.exports = Simple;

controller(module.exports, { path: '/simple' });

//　给get方法添加访问控制,使用key为simple1的配置内容作为默认配置.
acl(module.exports, { name: 'simple1', property: 'get' });
//　给post方法添加访问控制,使用key为default的配置内容作为默认配置.
acl(module.exports, { properties: ['post'] });
```

#### acl(target,opts) ####
访问控制注释函数，验证失败http status返回403.

**target**
路由功能对象的构建方法

**opts**
请求验证可选项参数

* opts.name {String | Symbol}: 使用默认配置名称
* opts.property {String | Symbol}: 生效目标对象成员方法
* opts.properties {Array<String | Symbol>}: 生效目标对象成员方法
* opts.payload {Object.<String | Symbol,String>}: 业务函数参数的映射对象

### Rate Limit ###
根据业务模块处理的结果，对请求进行限制，达到或超过限定的请求量http status返回429.


#### 配置 ####

``` javascript
// {cwd}/config/*.js
// {cwd}/node_modules/{xxx engine}/config/*.js
// {cwd}/node_modules/{xxx plugin}/config/*.js

exports.rateLimit = {
    default:{
        // 业务模块依赖信息
        module: { id: 'services', required: true, transform: _ => _.rateLimit },
        // 业务模块可选参数
        ...
    }
};
```

#### 示例 ####

``` javascript
// {cwd}/controllers/*.js
// {cwd}/node_modules/{xxx engine}/app/controllers/*.js
// {cwd}/node_modules/{xxx plugin}/app/controllers/*.js

const { controller } = require('brick-koa-adapter');
const { rateLimit } = require('brick-koa-app');

class Simple {

  post(ctx) {
    const payload = ctx.request.body;
    const token = ctx.jwt(payload);
    ctx.status = 201;
    ctx.body = { ...payload, token };
  }

  get(ctx) {
    const payload = ctx.state.jwt;
    ctx.status = 200;
    ctx.body = payload;
  }
}

module.exports = Simple;

controller(module.exports, { path: '/simple' });

//　给get方法添加流量限制,使用key为simple1的配置内容作为默认配置.
rateLimit(module.exports, { name: 'simple1', property: 'get' });
//　给post方法添加流量,使用key为default的配置内容作为默认配置.
rateLimit(module.exports, { properties: ['post'] });
```

#### rateLimit(target,opts) ####
流量限制注释函数，验证失败http status返回403.

**target**
路由功能对象的构建方法

**opts**
请求验证可选项参数

* opts.name {String | Symbol}: 使用默认配置名称
* opts.property {String | Symbol}: 生效目标对象成员方法
* opts.properties {Array<String | Symbol>}: 生效目标对象成员方法
* opts.payload {Object.<String | Symbol,String>}: 业务函数参数的映射对象

## Documentations ##
使用`jsdoc`生成注释文档

``` shell
git clone https://github.com/kiba-zhao/brick-koa-app.git
cd brick-koa-app
npm install
npm run docs
open docs/index.html
```

## License ##
[MIT](LICENSE)
