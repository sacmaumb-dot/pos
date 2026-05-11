export type PlanKey = "trial" | "basic" | "pro" | "professional";

export type PlanDefinition = {
  name: string;
  price: number; // VNĐ per month
  maxProducts: number;
  maxUsers: number;
  maxCustomers: number;
  maxBranches: number;
  maxDevices: number;
  canCustomPrint: boolean;
  features: string[];
};

export const PLANS: Record<PlanKey, PlanDefinition> = {
  trial: {
    name: "Dùng thử 14 ngày",
    price: 0,
    maxProducts: 50,
    maxUsers: 2,
    maxCustomers: 100,
    maxBranches: 1,
    maxDevices: 3,
    canCustomPrint: true,
    features: ["Đầy đủ tính năng Pro", "Hỗ trợ 14 ngày"],
  },
  basic: {
    name: "Cơ bản",
    price: 50000,
    maxProducts: 100,
    maxUsers: 2,
    maxCustomers: 500,
    maxBranches: 1,
    maxDevices: 3,
    canCustomPrint: false,
    features: ["Quản lý kho (100 SP)", "Bán hàng POS", "Quản lý khách hàng", "1 Cửa hàng", "3 Thiết bị đăng nhập"],
  },
  pro: {
    name: "Pro",
    price: 100000,
    maxProducts: 999999,
    maxUsers: 15,
    maxCustomers: 999999,
    maxBranches: 2,
    maxDevices: 15,
    canCustomPrint: true,
    features: [
      "Không giới hạn Sản phẩm/Khách hàng",
      "Tùy biến mẫu in (Inbill)",
      "Quản lý 2 cửa hàng chi nhánh",
      "15 Thiết bị đăng nhập",
      "Báo cáo chuyên sâu",
    ],
  },
  professional: {
    name: "Chuyên nghiệp",
    price: 150000,
    maxProducts: 999999,
    maxUsers: 999,
    maxCustomers: 999999,
    maxBranches: 5,
    maxDevices: 999,
    canCustomPrint: true,
    features: [
      "Tất cả tính năng gói Pro",
      "Quản lý 5 cửa hàng chi nhánh",
      "Không giới hạn thiết bị",
      "Ưu tiên cập nhật tính năng mới",
      "Hỗ trợ ưu tiên 24/7",
    ],
  },
};

export function getPlan(key: string): PlanDefinition {
  return PLANS[key as PlanKey] || PLANS.trial;
}
