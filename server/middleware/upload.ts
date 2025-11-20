import { IncomingForm, File as FormidableFile } from "formidable";
import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "contract-templates");
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {
  // Directory might already exist, ignore error
});

export interface UploadedFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

export interface RequestWithFiles extends Request {
  files?: {
    file?: UploadedFile[];
  };
  body: any;
}

export function uploadMiddleware() {
  return async (req: RequestWithFiles, res: Response, next: NextFunction) => {
    // Only process multipart/form-data
    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return next();
    }

    const form = new IncomingForm({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: (part) => {
        // Only allow Word documents
        if (part.name === "file") {
          const filename = part.filename || "";
          return (
            filename.endsWith(".doc") ||
            filename.endsWith(".docx") ||
            part.mimetype ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            part.mimetype === "application/msword"
          );
        }
        return true;
      },
    });

    try {
      const [fields, files] = await form.parse(req);

      // Convert formidable files to our format
      const uploadedFiles: UploadedFile[] = [];
      if (files.file) {
        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        for (const file of fileArray) {
          uploadedFiles.push({
            filepath: file.filepath,
            originalFilename: file.originalFilename || "unknown",
            mimetype: file.mimetype || "application/octet-stream",
            size: file.size,
          });
        }
      }

      // Convert fields to body
      const body: any = {};
      for (const [key, value] of Object.entries(fields)) {
        if (Array.isArray(value) && value.length > 0) {
          body[key] = value[0];
        } else if (value) {
          body[key] = value;
        }
      }

      req.body = body;
      req.files = { file: uploadedFiles };
      next();
    } catch (error: any) {
      res.status(400).json({ error: error.message || "File upload failed" });
    }
  };
}

