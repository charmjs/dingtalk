import { hmac } from 'hmac/mod.ts';

/**
 * 对钉钉机器人加签参数进行签名
 * @param secret 钉钉中设置的加签参数
 */
export function sign(secret: string): string {
    const timestamp = Date.now(); // 当前时间戳毫秒数
    const stringToSign = `${timestamp}\n${secret}`;
    const signResult = hmac('sha256', secret, stringToSign, 'utf8', 'base64') as string;
    return `timestamp=${timestamp}&sign=${encodeURIComponent(signResult)}`;
}

/** 延时函数 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

