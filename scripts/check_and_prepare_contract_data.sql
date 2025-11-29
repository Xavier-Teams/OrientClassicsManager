-- ============================================================================
-- CHECK AND PREPARE CONTRACT DATA FOR APPROVAL WORKFLOW
-- ============================================================================
-- Run this in pgAdmin (connected to translation_db)
-- Usage: Check if contract exists and has all required data
-- ============================================================================

-- ============================================================================
-- PART 1: CHECK CONTRACT DATA
-- ============================================================================

-- Replace '3' with your contract ID
\set contract_id '3'

-- 1. Check if contract exists
SELECT 
    '=== CONTRACT CHECK ===' as check_type,
    id,
    contract_number,
    status,
    total_amount,
    created_by_id,
    created_at
FROM translation_contracts 
WHERE id = CAST(:'contract_id' AS BIGINT) 
   OR contract_number = :'contract_id'
LIMIT 1;

-- 2. Check contract with creator info
SELECT 
    '=== CONTRACT WITH CREATOR ===' as check_type,
    c.id as contract_id,
    c.contract_number,
    c.created_by_id,
    u.id as user_id,
    u.email as creator_email,
    u.full_name as creator_name,
    u.role as creator_role,
    CASE 
        WHEN u.id IS NULL THEN '❌ No creator user found'
        WHEN u.email IS NULL OR u.email = '' THEN '⚠️ Creator has no email'
        ELSE '✅ Creator OK'
    END as creator_status
FROM translation_contracts c
LEFT JOIN users u ON c.created_by_id = u.id
WHERE c.id = CAST(:'contract_id' AS BIGINT) 
   OR c.contract_number = :'contract_id'
LIMIT 1;

-- 3. Check available approvers
SELECT 
    '=== AVAILABLE APPROVERS ===' as check_type,
    id,
    email,
    full_name,
    role,
    CASE role 
        WHEN 'truong_ban_thu_ky' THEN 1 
        WHEN 'pho_chu_nhiem' THEN 2 
        WHEN 'manager' THEN 3 
        ELSE 4
    END as priority
FROM users 
WHERE role IN ('manager', 'truong_ban_thu_ky', 'pho_chu_nhiem')
ORDER BY priority
LIMIT 5;

-- 4. Check existing approval workflows
SELECT 
    '=== EXISTING APPROVAL WORKFLOWS ===' as check_type,
    id,
    document_type,
    document_id,
    workflow_name,
    status,
    created_at
FROM approval_workflows
WHERE document_id = CAST(:'contract_id' AS BIGINT)
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- PART 2: PREPARE DATA (IF NEEDED)
-- ============================================================================

-- If contract exists but no creator, you can update it:
-- UPDATE translation_contracts 
-- SET created_by_id = (SELECT id FROM users WHERE role IN ('thu_ky_hop_phan', 'dich_gia') LIMIT 1)
-- WHERE id = CAST(:'contract_id' AS BIGINT) 
--   AND created_by_id IS NULL;

-- If no approvers exist, create a test manager:
-- INSERT INTO users (email, full_name, role, password_hash, created_at, updated_at)
-- VALUES (
--     'manager@test.com',
--     'Test Manager',
--     'manager',
--     '$2b$10$dummy_hash_for_test_only',  -- Dummy hash, update password later
--     NOW(),
--     NOW()
-- )
-- ON CONFLICT (email) DO NOTHING
-- RETURNING id, email, full_name, role;

-- ============================================================================
-- PART 3: VERIFICATION
-- ============================================================================

-- Verify all requirements are met
SELECT 
    '=== VERIFICATION SUMMARY ===' as check_type,
    (SELECT COUNT(*) FROM translation_contracts WHERE id = CAST(:'contract_id' AS BIGINT) OR contract_number = :'contract_id') > 0 as contract_exists,
    (SELECT COUNT(*) FROM translation_contracts c 
     LEFT JOIN users u ON c.created_by_id = u.id 
     WHERE (c.id = CAST(:'contract_id' AS BIGINT) OR c.contract_number = :'contract_id') 
       AND u.id IS NOT NULL) > 0 as has_creator,
    (SELECT COUNT(*) FROM users WHERE role IN ('manager', 'truong_ban_thu_ky', 'pho_chu_nhiem')) > 0 as has_approvers,
    (SELECT COUNT(*) FROM approval_workflows 
     WHERE document_id = CAST(:'contract_id' AS BIGINT) 
       AND status IN ('pending', 'in_progress')) = 0 as no_active_workflow;

