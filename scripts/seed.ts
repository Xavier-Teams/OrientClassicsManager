#!/usr/bin/env tsx
/**
 * Database Seed Script
 * Populates database with sample data for development and testing
 * 
 * Usage: tsx scripts/seed.ts
 */

import "dotenv/config";
import { db } from "../server/db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

// Hash password helper (simple bcrypt-like for demo)
async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt: await bcrypt.hash(password, 10)
  // For demo purposes, we'll use a simple hash
  return `hashed_${password}`;
}

async function seed() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Check if tables exist before clearing
    console.log("🔍 Checking database...");
    try {
      // Try to query users table to check if it exists
      await db.select().from(schema.users).limit(1);
      
      // Clear existing data (optional - comment out if you want to keep existing data)
      console.log("🧹 Clearing existing data...");
      await db.delete(schema.administrativeTasks);
      await db.delete(schema.editingTasks);
      await db.delete(schema.reviewEvaluations);
      await db.delete(schema.reviews);
      await db.delete(schema.councilMemberships);
      await db.delete(schema.reviewCouncils);
      await db.delete(schema.payments);
      await db.delete(schema.paymentMilestones);
      await db.delete(schema.contracts);
      await db.delete(schema.documents);
      await db.delete(schema.works);
      await db.delete(schema.users);
      console.log("✅ Existing data cleared\n");
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log("⚠️  Tables don't exist yet. Please run 'npm run db:push' first!");
        console.log("   Then run 'npm run db:seed' again.\n");
        process.exit(1);
      }
      throw error;
    }

    // ============================================================================
    // 1. CREATE USERS
    // ============================================================================
    console.log("👥 Creating users...");
    
    const users = await db.insert(schema.users).values([
      // Leadership
      {
        username: "chu_nhiem",
        password: await hashPassword("password123"),
        email: "chunhiem@orientclassics.vn",
        fullName: "GS.TS. Nguyễn Văn Chủ Nhiệm",
        role: "chu_nhiem",
        phone: "0901234567",
        bio: "Chủ nhiệm Dự án Kinh điển Phương Đông",
        active: true,
      },
      {
        username: "pho_chu_nhiem",
        password: await hashPassword("password123"),
        email: "phochunhiem@orientclassics.vn",
        fullName: "PGS.TS. Trần Thị Phó",
        role: "pho_chu_nhiem",
        phone: "0901234568",
        active: true,
      },
      {
        username: "truong_ban_thu_ky",
        password: await hashPassword("password123"),
        email: "truongban@orientclassics.vn",
        fullName: "TS. Lê Văn Trưởng Ban",
        role: "truong_ban_thu_ky",
        phone: "0901234569",
        active: true,
      },
      // Secretaries
      {
        username: "thu_ky_1",
        password: await hashPassword("password123"),
        email: "thuky1@orientclassics.vn",
        fullName: "ThS. Phạm Thị Thư Ký 1",
        role: "thu_ky_hop_phan",
        phone: "0901234570",
        active: true,
      },
      {
        username: "thu_ky_2",
        password: await hashPassword("password123"),
        email: "thuky2@orientclassics.vn",
        fullName: "ThS. Hoàng Văn Thư Ký 2",
        role: "thu_ky_hop_phan",
        phone: "0901234571",
        active: true,
      },
      // Office & Finance
      {
        username: "van_phong",
        password: await hashPassword("password123"),
        email: "vanphong@orientclassics.vn",
        fullName: "Nguyễn Thị Văn Phòng",
        role: "van_phong",
        phone: "0901234572",
        active: true,
      },
      {
        username: "ke_toan",
        password: await hashPassword("password123"),
        email: "ketoan@orientclassics.vn",
        fullName: "Trần Văn Kế Toán",
        role: "ke_toan",
        phone: "0901234573",
        active: true,
      },
      // Translators
      {
        username: "dich_gia_1",
        password: await hashPassword("password123"),
        email: "dichgia1@orientclassics.vn",
        fullName: "TS. Nguyễn Văn Dịch Giả 1",
        role: "dich_gia",
        phone: "0901234574",
        bio: "Chuyên dịch các tác phẩm Phật giáo",
        active: true,
      },
      {
        username: "dich_gia_2",
        password: await hashPassword("password123"),
        email: "dichgia2@orientclassics.vn",
        fullName: "TS. Trần Thị Dịch Giả 2",
        role: "dich_gia",
        phone: "0901234575",
        bio: "Chuyên dịch các tác phẩm Nho giáo",
        active: true,
      },
      {
        username: "dich_gia_3",
        password: await hashPassword("password123"),
        email: "dichgia3@orientclassics.vn",
        fullName: "PGS.TS. Lê Văn Dịch Giả 3",
        role: "dich_gia",
        phone: "0901234576",
        bio: "Chuyên dịch các tác phẩm Đạo giáo",
        active: true,
      },
      // Editors
      {
        username: "btv_1",
        password: await hashPassword("password123"),
        email: "btv1@orientclassics.vn",
        fullName: "ThS. Phạm Thị BTV 1",
        role: "bien_tap_vien",
        phone: "0901234577",
        active: true,
      },
      {
        username: "btv_2",
        password: await hashPassword("password123"),
        email: "btv2@orientclassics.vn",
        fullName: "ThS. Hoàng Văn BTV 2",
        role: "bien_tap_vien",
        phone: "0901234578",
        active: true,
      },
      // Technical
      {
        username: "ktv_1",
        password: await hashPassword("password123"),
        email: "ktv1@orientclassics.vn",
        fullName: "Kỹ thuật viên 1",
        role: "ky_thuat_vien",
        phone: "0901234579",
        active: true,
      },
      // Experts
      {
        username: "chuyen_gia_1",
        password: await hashPassword("password123"),
        email: "chuyengia1@orientclassics.vn",
        fullName: "GS.TS. Nguyễn Văn Chuyên Gia 1",
        role: "chuyen_gia",
        phone: "0901234580",
        bio: "Chuyên gia thẩm định Phật giáo",
        active: true,
      },
      {
        username: "chuyen_gia_2",
        password: await hashPassword("password123"),
        email: "chuyengia2@orientclassics.vn",
        fullName: "PGS.TS. Trần Thị Chuyên Gia 2",
        role: "chuyen_gia",
        phone: "0901234581",
        bio: "Chuyên gia thẩm định Nho giáo",
        active: true,
      },
    ]).returning();

    console.log(`✅ Created ${users.length} users\n`);

    // Get user IDs for references
    const chuNhiem = users.find(u => u.role === "chu_nhiem")!;
    const phoChuNhiem = users.find(u => u.role === "pho_chu_nhiem")!;
    const truongBan = users.find(u => u.role === "truong_ban_thu_ky")!;
    const thuKy1 = users.find(u => u.username === "thu_ky_1")!;
    const dichGia1 = users.find(u => u.username === "dich_gia_1")!;
    const dichGia2 = users.find(u => u.username === "dich_gia_2")!;
    const dichGia3 = users.find(u => u.username === "dich_gia_3")!;
    const btv1 = users.find(u => u.username === "btv_1")!;
    const btv2 = users.find(u => u.username === "btv_2")!;
    const ktv1 = users.find(u => u.username === "ktv_1")!;
    const chuyenGia1 = users.find(u => u.username === "chuyen_gia_1")!;
    const chuyenGia2 = users.find(u => u.username === "chuyen_gia_2")!;
    const keToan = users.find(u => u.username === "ke_toan")!;

    // ============================================================================
    // 2. CREATE WORKS (Tác phẩm)
    // ============================================================================
    console.log("📚 Creating works...");

    const works = await db.insert(schema.works).values([
      {
        name: "Kinh Kim Cương Bát Nhã Ba La Mật",
        author: "Bồ Tát Long Thọ",
        sourceLanguage: "Hán văn",
        targetLanguage: "Tiếng Việt",
        pageCount: 120,
        wordCount: 25000,
        description: "Kinh điển quan trọng của Phật giáo Đại thừa, giảng về tính không và trí tuệ Bát Nhã",
        translatorId: dichGia1.id,
        translationStatus: "in_progress",
        translationProgress: 65,
        priority: "high",
        createdById: thuKy1.id,
        metadata: { domain: "Buddhism", category: "Sutra" },
      },
      {
        name: "Luận Ngữ",
        author: "Khổng Tử",
        sourceLanguage: "Hán văn",
        targetLanguage: "Tiếng Việt",
        pageCount: 200,
        wordCount: 50000,
        description: "Tác phẩm kinh điển của Nho giáo, ghi chép lời dạy của Khổng Tử",
        translatorId: dichGia2.id,
        translationStatus: "completed",
        translationProgress: 100,
        priority: "normal",
        createdById: thuKy1.id,
        metadata: { domain: "Confucianism", category: "Classic" },
      },
      {
        name: "Đạo Đức Kinh",
        author: "Lão Tử",
        sourceLanguage: "Hán văn",
        targetLanguage: "Tiếng Việt",
        pageCount: 80,
        wordCount: 5000,
        description: "Tác phẩm cơ bản của Đạo giáo về đạo và đức",
        translatorId: dichGia3.id,
        translationStatus: "trial_translation",
        translationProgress: 30,
        priority: "normal",
        createdById: thuKy1.id,
        metadata: { domain: "Taoism", category: "Classic" },
      },
      {
        name: "Kinh Pháp Hoa",
        author: "Đức Phật Thích Ca",
        sourceLanguage: "Hán văn",
        targetLanguage: "Tiếng Việt",
        pageCount: 300,
        wordCount: 80000,
        description: "Một trong những bộ kinh quan trọng nhất của Phật giáo Đại thừa",
        translatorId: dichGia1.id,
        translationStatus: "draft",
        translationProgress: 0,
        priority: "urgent",
        createdById: truongBan.id,
        metadata: { domain: "Buddhism", category: "Sutra" },
      },
      {
        name: "Mạnh Tử",
        author: "Mạnh Tử",
        sourceLanguage: "Hán văn",
        targetLanguage: "Tiếng Việt",
        pageCount: 250,
        wordCount: 60000,
        description: "Tác phẩm của Mạnh Tử, một trong Tứ Thư của Nho giáo",
        translatorId: dichGia2.id,
        translationStatus: "progress_checked",
        translationProgress: 80,
        priority: "high",
        createdById: thuKy1.id,
        metadata: { domain: "Confucianism", category: "Classic" },
      },
      {
        name: "Nam Hoa Kinh",
        author: "Trang Tử",
        sourceLanguage: "Hán văn",
        targetLanguage: "Tiếng Việt",
        pageCount: 180,
        wordCount: 45000,
        description: "Tác phẩm triết học của Trang Tử, một trong những tác phẩm quan trọng của Đạo giáo",
        translatorId: dichGia3.id,
        translationStatus: "approved",
        translationProgress: 0,
        priority: "normal",
        createdById: thuKy1.id,
        metadata: { domain: "Taoism", category: "Philosophy" },
      },
    ]).returning();

    console.log(`✅ Created ${works.length} works\n`);

    const work1 = works[0]; // Kinh Kim Cương - in_progress
    const work2 = works[1]; // Luận Ngữ - completed
    const work3 = works[2]; // Đạo Đức Kinh - trial_translation
    const work4 = works[4]; // Mạnh Tử - progress_checked

    // ============================================================================
    // 3. CREATE CONTRACTS
    // ============================================================================
    console.log("📝 Creating contracts...");

    const contracts = await db.insert(schema.contracts).values([
      {
        contractNumber: "HD-2024-001",
        workId: work1.id,
        translatorId: dichGia1.id,
        totalAmount: 50000000,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-30"),
        status: "active",
        terms: "Hợp đồng dịch thuật tác phẩm Kinh Kim Cương",
        createdById: thuKy1.id,
        signedDate: new Date("2024-01-15"),
      },
      {
        contractNumber: "HD-2024-002",
        workId: work2.id,
        translatorId: dichGia2.id,
        totalAmount: 80000000,
        startDate: new Date("2023-06-01"),
        endDate: new Date("2024-03-31"),
        status: "completed",
        terms: "Hợp đồng dịch thuật tác phẩm Luận Ngữ",
        createdById: thuKy1.id,
        signedDate: new Date("2023-06-10"),
      },
      {
        contractNumber: "HD-2024-003",
        workId: work3.id,
        translatorId: dichGia3.id,
        totalAmount: 30000000,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-05-31"),
        status: "signed",
        terms: "Hợp đồng dịch thuật tác phẩm Đạo Đức Kinh",
        createdById: thuKy1.id,
        signedDate: new Date("2024-02-15"),
      },
      {
        contractNumber: "HD-2024-004",
        workId: work4.id,
        translatorId: dichGia2.id,
        totalAmount: 70000000,
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-08-31"),
        status: "active",
        terms: "Hợp đồng dịch thuật tác phẩm Mạnh Tử",
        createdById: thuKy1.id,
        signedDate: new Date("2024-03-10"),
      },
    ]).returning();

    console.log(`✅ Created ${contracts.length} contracts\n`);

    const contract1 = contracts[0];
    const contract2 = contracts[1];
    const contract3 = contracts[2];
    const contract4 = contracts[3];

    // ============================================================================
    // 4. CREATE PAYMENT MILESTONES & PAYMENTS
    // ============================================================================
    console.log("💰 Creating payment milestones and payments...");

    // Payment milestones for contract1
    const milestones1 = await db.insert(schema.paymentMilestones).values([
      {
        contractId: contract1.id,
        sequenceNumber: 1,
        type: "advance_1",
        amount: 15000000,
        percentage: 30,
        dueDate: new Date("2024-02-01"),
        description: "Tạm ứng lần 1 - 30%",
      },
      {
        contractId: contract1.id,
        sequenceNumber: 2,
        type: "advance_2",
        amount: 20000000,
        percentage: 40,
        dueDate: new Date("2024-04-01"),
        description: "Tạm ứng lần 2 - 40%",
      },
      {
        contractId: contract1.id,
        sequenceNumber: 3,
        type: "final_settlement",
        amount: 15000000,
        percentage: 30,
        dueDate: new Date("2024-07-01"),
        description: "Quyết toán - 30%",
      },
    ]).returning();

    // Payments for contract1
    await db.insert(schema.payments).values([
      {
        contractId: contract1.id,
        milestoneId: milestones1[0].id,
        type: "advance_1",
        amount: 15000000,
        status: "paid",
        requestDate: new Date("2024-01-20"),
        approvedDate: new Date("2024-01-25"),
        approvedById: keToan.id,
        paidDate: new Date("2024-01-28"),
      },
      {
        contractId: contract1.id,
        milestoneId: milestones1[1].id,
        type: "advance_2",
        amount: 20000000,
        status: "processing",
        requestDate: new Date("2024-04-05"),
        approvedDate: new Date("2024-04-10"),
        approvedById: keToan.id,
      },
    ]);

    // Payment milestones for contract2 (completed)
    const milestones2 = await db.insert(schema.paymentMilestones).values([
      {
        contractId: contract2.id,
        sequenceNumber: 1,
        type: "advance_1",
        amount: 24000000,
        percentage: 30,
        dueDate: new Date("2023-07-01"),
        description: "Tạm ứng lần 1",
      },
      {
        contractId: contract2.id,
        sequenceNumber: 2,
        type: "advance_2",
        amount: 32000000,
        percentage: 40,
        dueDate: new Date("2023-12-01"),
        description: "Tạm ứng lần 2",
      },
      {
        contractId: contract2.id,
        sequenceNumber: 3,
        type: "final_settlement",
        amount: 24000000,
        percentage: 30,
        dueDate: new Date("2024-04-01"),
        description: "Quyết toán",
      },
    ]).returning();

    // All payments for contract2 are paid
    await db.insert(schema.payments).values([
      {
        contractId: contract2.id,
        milestoneId: milestones2[0].id,
        type: "advance_1",
        amount: 24000000,
        status: "paid",
        requestDate: new Date("2023-06-15"),
        approvedDate: new Date("2023-06-20"),
        approvedById: keToan.id,
        paidDate: new Date("2023-06-25"),
      },
      {
        contractId: contract2.id,
        milestoneId: milestones2[1].id,
        type: "advance_2",
        amount: 32000000,
        status: "paid",
        requestDate: new Date("2023-11-20"),
        approvedDate: new Date("2023-11-25"),
        approvedById: keToan.id,
        paidDate: new Date("2023-11-30"),
      },
      {
        contractId: contract2.id,
        milestoneId: milestones2[2].id,
        type: "final_settlement",
        amount: 24000000,
        status: "paid",
        requestDate: new Date("2024-03-20"),
        approvedDate: new Date("2024-03-25"),
        approvedById: keToan.id,
        paidDate: new Date("2024-03-30"),
      },
    ]);

    console.log("✅ Created payment milestones and payments\n");

    // ============================================================================
    // 5. CREATE REVIEW COUNCILS
    // ============================================================================
    console.log("👥 Creating review councils...");

    const councils = await db.insert(schema.reviewCouncils).values([
      {
        name: "Hội đồng thẩm định dịch thử - Đạo Đức Kinh",
        type: "trial_review",
        description: "Hội đồng thẩm định bản dịch thử tác phẩm Đạo Đức Kinh",
        establishedDate: new Date("2024-03-01"),
        active: true,
      },
      {
        name: "Hội đồng thẩm định chuyên gia - Luận Ngữ",
        type: "expert_review",
        description: "Hội đồng thẩm định chuyên gia cho tác phẩm Luận Ngữ",
        establishedDate: new Date("2024-01-15"),
        active: true,
      },
    ]).returning();

    // Add council memberships
    await db.insert(schema.councilMemberships).values([
      {
        councilId: councils[0].id,
        userId: chuNhiem.id,
        role: "chairman",
        active: true,
      },
      {
        councilId: councils[0].id,
        userId: thuKy1.id,
        role: "secretary",
        active: true,
      },
      {
        councilId: councils[0].id,
        userId: chuyenGia1.id,
        role: "expert",
        active: true,
      },
      {
        councilId: councils[1].id,
        userId: phoChuNhiem.id,
        role: "chairman",
        active: true,
      },
      {
        councilId: councils[1].id,
        userId: thuKy1.id,
        role: "secretary",
        active: true,
      },
      {
        councilId: councils[1].id,
        userId: chuyenGia2.id,
        role: "expert",
        active: true,
      },
    ]);

    console.log(`✅ Created ${councils.length} review councils\n`);

    // ============================================================================
    // 6. CREATE REVIEWS
    // ============================================================================
    console.log("📋 Creating reviews...");

    const reviews = await db.insert(schema.reviews).values([
      {
        workId: work3.id,
        councilId: councils[0].id,
        type: "trial_review",
        status: "in_progress",
        scheduledDate: new Date("2024-03-15"),
        overallRating: null,
      },
      {
        workId: work2.id,
        councilId: councils[1].id,
        type: "expert_review",
        status: "completed",
        scheduledDate: new Date("2024-01-20"),
        completedDate: new Date("2024-02-10"),
        overallRating: 9,
        decision: "Đạt",
        recommendations: "Bản dịch chất lượng cao, có thể xuất bản",
      },
    ]).returning();

    // Create review evaluations
    await db.insert(schema.reviewEvaluations).values([
      {
        reviewId: reviews[1].id,
        reviewerId: chuyenGia2.id,
        isAnonymous: false,
        rating: 9,
        comments: "Bản dịch chính xác, phong cách tự nhiên",
        strengths: "Dịch đúng nghĩa, thuật ngữ nhất quán",
        weaknesses: "Một số chỗ có thể cải thiện cách diễn đạt",
        recommendations: "Nên xuất bản",
      },
    ]);

    console.log(`✅ Created ${reviews.length} reviews\n`);

    // ============================================================================
    // 7. CREATE EDITING TASKS
    // ============================================================================
    console.log("✏️ Creating editing tasks...");

    await db.insert(schema.editingTasks).values([
      {
        workId: work2.id,
        stepName: "Biên tập bông 1",
        assignedRole: "BTV1",
        assignedToId: btv1.id,
        status: "completed",
        dueDate: new Date("2024-02-20"),
        completedDate: new Date("2024-02-18"),
        notes: "Đã hoàn thành biên tập bông 1",
      },
      {
        workId: work2.id,
        stepName: "Mi trang",
        assignedRole: "KTV",
        assignedToId: ktv1.id,
        status: "in_progress",
        dueDate: new Date("2024-03-15"),
        notes: "Đang thiết kế layout",
      },
      {
        workId: work1.id,
        stepName: "Hiệu đính",
        assignedRole: "BTV2",
        assignedToId: btv2.id,
        status: "pending",
        dueDate: new Date("2024-07-01"),
        notes: "Chờ hoàn thành bản dịch",
      },
    ]);

    console.log("✅ Created editing tasks\n");

    // ============================================================================
    // 8. CREATE ADMINISTRATIVE TASKS
    // ============================================================================
    console.log("📋 Creating administrative tasks...");

    await db.insert(schema.administrativeTasks).values([
      {
        title: "Chuẩn bị hồ sơ thanh toán tạm ứng lần 2 - HD-2024-001",
        description: "Chuẩn bị các giấy tờ cần thiết cho thanh toán tạm ứng lần 2 của hợp đồng HD-2024-001",
        assignedToId: keToan.id,
        createdById: thuKy1.id,
        status: "in_progress",
        priority: "high",
        dueDate: new Date("2024-04-10"),
      },
      {
        title: "Xin giấy phép xuất bản - Luận Ngữ",
        description: "Chuẩn bị hồ sơ và gửi NXB xin giấy phép xuất bản cho tác phẩm Luận Ngữ",
        assignedToId: users.find(u => u.role === "van_phong")!.id,
        createdById: truongBan.id,
        status: "pending",
        priority: "normal",
        dueDate: new Date("2024-04-30"),
      },
      {
        title: "Lưu trữ hồ sơ hợp đồng HD-2024-002",
        description: "Lưu trữ và phân loại hồ sơ hợp đồng đã hoàn thành",
        assignedToId: users.find(u => u.role === "van_thu")!.id,
        createdById: thuKy1.id,
        status: "completed",
        priority: "low",
        dueDate: new Date("2024-04-01"),
        completedDate: new Date("2024-04-01"),
      },
    ]);

    console.log("✅ Created administrative tasks\n");

    // ============================================================================
    // 9. CLICKUP-LIKE TASK LISTS, TASKS, SAVED VIEWS
    // ============================================================================
    console.log("🗂️ Creating task lists, tasks and default views...");

    const [defaultList] = await db.insert(schema.taskLists).values({
      name: "Danh sách mặc định",
      description: "Nhiệm vụ chung cho dự án",
      createdById: thuKy1.id,
    }).returning();

    const createdTasks = await db.insert(schema.tasks).values([
      {
        listId: defaultList.id,
        name: "Lập kế hoạch biên tập Luận Ngữ",
        description: "Chuẩn bị checklist biên tập, phân công BTV",
        status: "pending",
        priority: "normal",
        dueDate: new Date("2024-05-15"),
        createdById: thuKy1.id,
        relatedWorkId: work2.id,
      },
      {
        listId: defaultList.id,
        name: "Theo dõi KTTĐ Mạnh Tử",
        description: "Kiểm tra báo cáo tiến độ và đôn đốc",
        status: "in_progress",
        priority: "high",
        dueDate: new Date("2024-05-10"),
        createdById: thuKy1.id,
        relatedWorkId: work4.id,
      },
      {
        listId: defaultList.id,
        name: "Chuẩn bị hồ sơ cấp phép xuất bản Luận Ngữ",
        description: "Tổng hợp tài liệu để xin giấy phép",
        status: "pending",
        priority: "normal",
        dueDate: new Date("2024-05-25"),
        createdById: truongBan.id,
        relatedWorkId: work2.id,
      },
    ]).returning();

    await db.insert(schema.taskAssignees).values([
      { taskId: createdTasks[0].id, userId: btv1.id },
      { taskId: createdTasks[1].id, userId: thuKy1.id },
      { taskId: createdTasks[2].id, userId: users.find(u => u.role === "van_phong")!.id },
    ]);

    await db.insert(schema.savedViews).values([
      {
        ownerId: thuKy1.id,
        name: "Board theo trạng thái",
        viewType: "board",
        groupBy: "status",
        filters: { listId: defaultList.id },
        sort: { by: "updatedAt", order: "desc" } as any,
      },
      {
        ownerId: thuKy1.id,
        name: "List theo mức ưu tiên",
        viewType: "list",
        groupBy: "priority",
        filters: { listId: defaultList.id },
        sort: { by: "priority", order: "desc" } as any,
      },
      {
        ownerId: thuKy1.id,
        name: "Calendar theo hạn",
        viewType: "calendar",
        groupBy: "dueDate",
        filters: { listId: defaultList.id },
        sort: { by: "dueDate", order: "asc" } as any,
      },
    ]);

    console.log("✅ Created task lists, tasks and default saved views\n");

    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log("=".repeat(60));
    console.log("✅ Database seeding completed successfully!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📚 Works: ${works.length}`);
    console.log(`   📝 Contracts: ${contracts.length}`);
    console.log(`   💰 Payments: Created`);
    console.log(`   👥 Review Councils: ${councils.length}`);
    console.log(`   📋 Reviews: ${reviews.length}`);
    console.log(`   ✏️ Editing Tasks: Created`);
    console.log(`   📋 Administrative Tasks: Created`);
    console.log("\n🔑 Test Accounts:");
    console.log("   - Chủ nhiệm: chu_nhiem / password123");
    console.log("   - Thư ký: thu_ky_1 / password123");
    console.log("   - Dịch giả 1: dich_gia_1 / password123");
    console.log("   - BTV: btv_1 / password123");
    console.log("\n🚀 You can now start the server and test the API!");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed
seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

