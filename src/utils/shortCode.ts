import crypto from 'crypto';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const generateShortCode = (length: number = 7): string => {
    let code = '';
    const bytes = crypto.randomBytes(length)!; 
    
    for (let i = 0; i < length; i++) {
      //@ts-ignore
        code += CHARS[bytes[i] % CHARS.length];
    }
    return code;
};