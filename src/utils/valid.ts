/*
 * 通用参数校验工具 v2
 * 支持多种类型、必填项、范围、正则、自定义校验、数组 & 对象嵌套
 */

// 基础规则
interface BaseRule {
    required?: boolean;                                      // 是否必填
    custom?: (value: unknown) => true | string;             // 自定义校验，返回 true 或错误信息
}

// 各类型规则扩展
export interface StringRule extends BaseRule {
    type: 'string' | 'email' | 'url';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}

export interface NumberRule extends BaseRule {
    type: 'number';
    min?: number;
    max?: number;
}

export interface BooleanRule extends BaseRule {
    type: 'boolean';
}

export interface ArrayRule extends BaseRule {
    type: 'array';
    items?: Rule;                                           // 单个元素规则
    minItems?: number;
    maxItems?: number;
}

export interface ObjectRule extends BaseRule {
    type: 'object';
    properties: ValidationRules;                            // 对象字段规则
}

type Rule = StringRule | NumberRule | BooleanRule | ArrayRule | ObjectRule;
export type ValidationRules = Record<string, Rule>;

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

/**
 * 核心校验函数
 */
export function validateParams(
    rules: ValidationRules,
    data: Record<string, unknown>
): ValidationResult {
    const errors: Record<string, string> = {};

    /**
     * 递归校验单个规则
     */
    function validateRule(rule: Rule, value: unknown, path: string): void {
        // 必填校验
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors[path] = 'Required';
            return;
        }
        if (value == null) {
            return; // 非必填且无值
        }

        switch (rule.type) {
            case 'string':
            case 'email':
            case 'url': {
                if (typeof value !== 'string') {
                    errors[path] = 'Must be a string';
                    break;
                }
                const str = value;
                if (rule.minLength !== undefined && str.length < rule.minLength) {
                    errors[path] = `Min length is ${rule.minLength}`;
                }
                if (rule.maxLength !== undefined && str.length > rule.maxLength) {
                    errors[path] = `Max length is ${rule.maxLength}`;
                }
                if (rule.pattern && !rule.pattern.test(str)) {
                    errors[path] = 'Invalid format';
                }
                if (rule.type === 'email' && !/^[\w.-]+@[\w.-]+\.\w+$/.test(str)) {
                    errors[path] = 'Invalid email';
                }
                if (rule.type === 'url' && !/^https?:\/\/\S+$/.test(str)) {
                    errors[path] = 'Invalid URL';
                }
                break;
            }
            case 'number': {
                if (typeof value !== 'number' || isNaN(value)) {
                    errors[path] = 'Must be a number';
                    break;
                }
                const num = value;
                if (rule.min !== undefined && num < rule.min) {
                    errors[path] = `Min value is ${rule.min}`;
                }
                if (rule.max !== undefined && num > rule.max) {
                    errors[path] = `Max value is ${rule.max}`;
                }
                break;
            }
            case 'boolean': {
                if (typeof value !== 'boolean') {
                    errors[path] = 'Must be a boolean';
                }
                break;
            }
            case 'array': {
                if (!Array.isArray(value)) {
                    errors[path] = 'Must be an array';
                    break;
                }
                const arr = value as unknown[];
                if (rule.minItems !== undefined && arr.length < rule.minItems) {
                    errors[path] = `Min items is ${rule.minItems}`;
                }
                if (rule.maxItems !== undefined && arr.length > rule.maxItems) {
                    errors[path] = `Max items is ${rule.maxItems}`;
                }
                if (rule.items) {
                    arr.forEach((item, idx) => {
                        validateRule(rule.items as Rule, item, `${path}[${idx}]`);
                    });
                }
                break;
            }
            case 'object': {
                if (typeof value !== 'object' || Array.isArray(value)) {
                    errors[path] = 'Must be an object';
                    break;
                }
                const obj = value as Record<string, unknown>;
                for (const key in rule.properties) {
                    validateRule(rule.properties[key], obj[key], `${path}.${key}`);
                }
                break;
            }
        }

        // 自定义校验
        if (rule.custom) {
            const result = rule.custom(value);
            if (result !== true) {
                errors[path] = result;
            }
        }
    }

    // 遍历入口规则
    for (const field in rules) {
        validateRule(rules[field], data[field], field);
    }

    return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * 单参数校验函数
 */
export function validateParam(
    rule: Rule,
    value: unknown,
    fieldName = 'value'
): { isValid: boolean; error?: string } {
    const result = validateParams({ [fieldName]: rule }, { [fieldName]: value });
    if (result.isValid) {
        return { isValid: true };
    }
    return { isValid: false, error: result.errors[fieldName] };
}
