import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';

export const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);

export const ensureUploadDir = async (): Promise<void> => {
  await fs.mkdir(uploadDir, { recursive: true });
};

export const cleanupFiles = async (
  files: Array<{ path?: string | undefined }> | undefined
): Promise<void> => {
  if (!files?.length) {
    return;
  }

  await Promise.allSettled(
    files
      .map((file) => file.path)
      .filter((filePath): filePath is string => Boolean(filePath))
      .map((filePath) => fs.unlink(filePath).catch(() => undefined))
  );
};
