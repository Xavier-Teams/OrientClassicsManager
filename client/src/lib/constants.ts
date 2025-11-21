export const WORK_STATUS_LABELS: Record<string, string> = {
  draft: "Dự kiến",
  approved: "Đã duyệt",
  translator_assigned: "Đã gán dịch giả",
  trial_translation: "Dịch thử",
  trial_reviewed: "Đã thẩm định dịch thử",
  contract_signed: "Đã ký hợp đồng",
  in_progress: "Đang dịch",
  progress_checked: "Đã kiểm tra tiến độ",
  final_translation: "Dịch hoàn thiện",
  expert_reviewed: "Đã thẩm định chuyên gia",
  project_accepted: "Đã nghiệm thu Dự án",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ thẩm định",
  in_progress: "Đang thẩm định",
  completed: "Đã hoàn thành",
  approved: "Đã phê duyệt",
  rejected: "Từ chối",
};

export const EDITING_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ biên tập",
  proofreading: "Hiệu đính",
  editing_draft: "Biên tập thô",
  proof_1: "Bông 1",
  proof_2: "Bông 2",
  proof_3: "Bông 3",
  proof_4: "Bông 4",
  final_approval: "Duyệt cuối",
  completed: "Hoàn thành",
};

export const PUBLISHING_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xuất bản",
  license_pending: "Chờ giấy phép",
  licensed: "Đã có giấy phép",
  in_production: "Đang in",
  published: "Đã xuất bản",
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: "Dự thảo",
  pending_approval: "Chờ phê duyệt",
  signed: "Đã ký",
  active: "Đang thực hiện",
  completed: "Hoàn thành",
  terminated: "Chấm dứt",
  cancelled: "Đã hủy",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ phê duyệt",
  approved: "Đã phê duyệt",
  rejected: "Đã từ chối",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy",
};

export const PAYMENT_WORK_GROUP_LABELS: Record<string, string> = {
  dich_thuat: "Dịch thuật",
  bien_tap: "Biên tập",
  cntt: "CNTT",
  hanh_chinh: "Hành chính",
  khac: "Khác",
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  advance_1: "Tạm ứng lần 1",
  advance_2: "Tạm ứng lần 2",
  final_settlement: "Quyết toán",
  bonus: "Thưởng",
  other: "Khác",
};

export const REVIEW_TYPE_LABELS: Record<string, string> = {
  trial_review: "Thẩm định dịch thử",
  progress_check: "Kiểm tra tiến độ (KTTĐ)",
  expert_review: "Thẩm định chuyên gia (TĐCCG)",
  project_acceptance: "Nghiệm thu Dự án (NTCDA)",
  proofreading_review: "Đánh giá hiệu đính",
};

export const USER_ROLE_LABELS: Record<string, string> = {
  chu_nhiem: "Chủ nhiệm",
  pho_chu_nhiem: "Phó Chủ nhiệm",
  truong_ban_thu_ky: "Trưởng ban Thư ký",
  thu_ky_hop_phan: "Thư ký hợp phần",
  van_phong: "Văn phòng",
  ke_toan: "Kế toán",
  van_thu: "Văn thư",
  bien_tap_vien: "Biên tập viên",
  ky_thuat_vien: "Kỹ thuật viên",
  dich_gia: "Dịch giả",
  chuyen_gia: "Chuyên gia",
  phu_trach_nhan_su: "Phụ trách Nhân sự",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Thấp",
  normal: "Trung bình",
  high: "Cao",
  urgent: "Khẩn",
};

// Map Django priority ('0', '1', '2') to frontend priority ('normal', 'high', 'urgent')
export const PRIORITY_MAP: Record<string, string> = {
  "0": "normal", // Bình thường
  "1": "high", // Cao
  "2": "urgent", // Khẩn
};

// Reverse map: frontend priority to Django priority
export const PRIORITY_REVERSE_MAP: Record<string, string> = {
  normal: "0",
  high: "1",
  urgent: "2",
  low: "0", // low maps to normal
};

// Helper function to convert Django priority to frontend priority
export function mapPriorityFromDjango(djangoPriority: string): string {
  return PRIORITY_MAP[djangoPriority] || "normal";
}

// Helper function to convert frontend priority to Django priority
export function mapPriorityToDjango(frontendPriority: string): string {
  return PRIORITY_REVERSE_MAP[frontendPriority] || "0";
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  source: "Bản nền",
  translation: "Bản dịch",
  trial_translation: "Bản dịch thử",
  review: "Phiếu thẩm định",
  contract: "Hợp đồng",
  payment: "Chứng từ thanh toán",
  editing: "File biên tập",
  proof: "Bông (proof)",
  form: "Biểu mẫu",
  other: "Khác",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xử lý",
  in_progress: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const EDITING_STEPS = [
  { value: "proofreading", label: "Hiệu đính", role: "chuyen_gia" },
  {
    value: "editing_draft",
    label: "Biên tập thô (BTV2)",
    role: "bien_tap_vien",
  },
  { value: "cover_design", label: "Thiết kế bìa", role: "ky_thuat_vien" },
  { value: "proof_1", label: "Biên tập Bông 1 (BTV1)", role: "bien_tap_vien" },
  { value: "layout", label: "Mi trang (KTV)", role: "ky_thuat_vien" },
  { value: "proof_2", label: "Biên tập Bông 2", role: "bien_tap_vien" },
  { value: "proof_3", label: "Đọc duyệt Bông 3", role: "bien_tap_vien" },
  { value: "license", label: "Xin giấy phép xuất bản", role: "van_phong" },
  { value: "proof_4", label: "Hoàn thiện Bông 4", role: "bien_tap_vien" },
  { value: "final_check", label: "Kiểm tra file cuối", role: "ky_thuat_vien" },
  { value: "printing", label: "Giao in", role: "van_phong" },
];

export const APP_NAME = "Quản lý Dự án Kinh điển phương Đông";
export const APP_NAME_SHORT = "KDPĐ";
