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
    package:'brick-koa-app
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
// {cwd}/node_modules/{xxx engine}/controllers/*.js
// {cwd}/node_modules/{xxx plugin}/controllers/*.js

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
给ctx注入jwt签名方法

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
增加验证jwt token方法

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
// {cwd}/node_modules/{xxx engine}/services/*.js
// {cwd}/node_modules/{xxx plugin}/services/*.js

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


## Documentations ##
使用`jsdoc`生成注释文档

``` shell
git clone https://github.com/kiba-zhao/brick-koa-adapter.git
cd brick-koa-adapter
npm install
npm run docs
open docs/index.html
```

## License ##
[MIT](LICENSE)
