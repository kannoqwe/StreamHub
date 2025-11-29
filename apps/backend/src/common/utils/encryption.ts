import bcrypt from 'bcrypt';

export async function encrypt(text: string): Promise<string> {
    return await bcrypt.hash(text, 12);
}

export async function compare(text: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(text, hash);
}
