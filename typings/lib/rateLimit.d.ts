/**
 * 限流注释可选项
 */
export type RateLimitOpts = {
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
     * 业务函数参数的映射对象
     */
    payload?: any;
};
/**
 * 限流注释可选项
 * @typedef {Object} RateLimitOpts
 * @property {String | Symbol} [name='default'] 配置名称
 * @property {String | Symbol} [property] 生效目标对象成员方法
 * @property {Array<String | Symbol>} [properties] 生效目标对象成员方法
 * @property {Object.<String | Symbol,String>} [payload] 业务函数参数的映射对象
 */
/**
 * 限流注释函数
 * @param {Any} target 目标对象
 * @param {RateLimitOpts} opts 可选项
 * @return {Any} 目标对象
 */
export function rateLimit(target: any, opts: RateLimitOpts): any;
export function setup(engine: any): any;
