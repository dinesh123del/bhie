import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';
export const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
export const ensureUploadDir = async () => {
    await fs.mkdir(uploadDir, { recursive: true });
};
export const cleanupFiles = async (files) => {
    if (!files?.length) {
        return;
    }
    await Promise.allSettled(files
        .map((file) => file.path)
        .filter((filePath) => Boolean(filePath))
        .map((filePath) => fs.unlink(filePath).catch(() => undefined)));
};
