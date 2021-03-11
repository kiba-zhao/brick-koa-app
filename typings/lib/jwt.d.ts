/**
 * jwt验证可选项
 */
export type VerifyOpts = {
    /**
     * 配置名称
     */
    name?: string | Symbol;
    /**
     * 生效目标对象成员方法
     */
    property?: string | Symbol;
    /**
     * 生效目标对象成员方法
     */
    properties?: Array<string | Symbol>;
    /**
     * payload注入到ctx.state的key
     */
    key?: string | Symbol;
    /**
     * 验证异常注入到ctx.state的key
     */
    passthrough?: string | Symbol;
    /**
     * 验证密钥
     */
    secret?: string;
    /**
     * 验证公钥
     */
    publicKey?: string | Buffer;
    /**
     * 验证可选项，详细请参考jsonwebtoken中verify方法参数说明
     */
    verifyOpts?: any;
};
/**
 * jwt签名可选项
 */
export type SignOpts = {
    /**
     * 配置名称
     */
    name?: string | Symbol;
    /**
     * 生效目标对象成员方法
     */
    property?: string | Symbol;
    /**
     * 生效目标对象成员方法
     */
    properties?: Array<string | Symbol>;
    /**
     * 签名函数注入到ctx上的方法名称
     */
    key?: string | Symbol;
    /**
     * 签名密钥
     */
    secret?: string;
    /**
     * 签名私钥
     */
    privateKey?: string | Buffer;
    /**
     * 签名可选项，详细请参考jsonwebtoken中sign方法参数说明
     */
    signOpts?: any;
};
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
 * 验证方法
 * @param {Any} target 目标对象
 * @param {VerifyOpts} opts jwt验证可选项
 * @return {Any} 目标对象
 */
export function verify(target: any, opts: VerifyOpts): any;
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
 * 签名方法
 * @param {Any} target 目标对象
 * @param {SignOpts} opts jwt可选项
 * @return {Any} 目标对象
 */
export function sign(target: any, opts: SignOpts): any;
export function setup(engine: any): void;
