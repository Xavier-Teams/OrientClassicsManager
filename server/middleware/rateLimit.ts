import type { Request, Response, NextFunction } from "express";

type Key = string;

interface Options {
  windowMs: number;
  max: number;
}

const buckets = new Map<Key, { count: number; first: number }>();

export function rateLimit(opts: Options) {
  const windowMs = Math.max(1000, opts.windowMs);
  const max = Math.max(1, opts.max);
  return function (req: Request, res: Response, next: NextFunction) {
    const ip =
      req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const key = `${ip}:${req.method}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket) {
      buckets.set(key, { count: 1, first: now });
      return next();
    }
    if (now - bucket.first > windowMs) {
      bucket.count = 1;
      bucket.first = now;
      return next();
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }
    next();
  };
}
