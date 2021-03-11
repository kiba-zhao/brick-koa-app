/**
 * ajv验证可选想
 */
export type ValidateOpts = {
    /**
     * schema名称
     */
    name?: string | Symbol;
    /**
     * schema对象
     */
    schema?: any;
    /**
     * schema字典对象
     */
    schemas?: any;
    /**
     * 生效目标对象成员方法
     */
    property?: string | Symbol;
    /**
     * 生效目标对象成员方法
     */
    properties?: Array<string | Symbol>;
    /**
     * 验证结果注入到ctx.state的key
     */
    key?: string | Symbol;
};
/**
 * ajv验证可选想
 * @typedef {Object} ValidateOpts
 * @property {String | Symbol} [name] schema名称
 * @property {Object} [schema] schema对象
 * @property {Object.<String|Symbol,String|Symbol|Object>} [schemas] schema字典对象
 * @property {String | Symbol} [property] 生效目标对象成员方法
 * @property {Array<String | Symbol>} [properties] 生效目标对象成员方法
 * @property {String | Symbol} [key] 验证结果注入到ctx.state的key
 */
/**
 * 验证注释方法
 * @param {Any} target 目标对象
 * @param {ValidateOpts} opts 验证可选想
 * @return {Any} 目标对象
 */
export function validate(target: any, opts: ValidateOpts): any;
export function setup(engine: any): void;
