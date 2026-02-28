import type { Request, Response, NextFunction } from "express";

export type UserRole =
  | "chu_nhiem"
  | "pho_chu_nhiem"
  | "truong_ban_thu_ky"
  | "thu_ky_hop_phan"
  | "van_phong"
  | "ke_toan"
  | "van_thu"
  | "bien_tap_vien"
  | "ky_thuat_vien"
  | "dich_gia"
  | "chuyen_gia";

export function getRequestRole(req: Request): UserRole | null {
  const role = (req.headers["x-user-role"] as string | undefined)?.trim();
  if (!role) return null;
  return role as UserRole;
}

export function requireRole(allowed: UserRole[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const role = getRequestRole(req);
    if (!role) {
      return res.status(401).json({ error: "Missing user role" });
    }
    if (!allowed.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
