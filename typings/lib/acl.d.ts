/**
 * 访问控制注释可选项
 */
export type ACLOpts = {
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
 * 访问控制注释可选项
 * @typedef {Object} ACLOpts
 * @property {String | Symbol} [name='default'] 配置名称
 * @property {String | Symbol} [property] 生效目标对象成员方法
 * @property {Array<String | Symbol>} [properties] 生效目标对象成员方法
 * @property {Object.<String | Symbol,String>} [payload] 业务函数参数的映射对象
 */
/**
 * 访问控制注释函数
 * @param {Any} target 目标对象
 * @param {ACLOpts} opts 可选项
 * @return {Any} 目标象对
 */
export function acl(target: any, opts: ACLOpts): any;
export function setup(engine: any): any;
