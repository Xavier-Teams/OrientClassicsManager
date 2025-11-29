-- Get Contract IDs from translation_contracts for testing
-- Run this in pgAdmin connected to translation_db

-- Get recent contracts
SELECT 
    id,
    contract_number,
    status,
    total_amount,
    created_at,
    created_by_id
FROM translation_contracts
ORDER BY created_at DESC
LIMIT 10;

-- Get contracts with creator info
SELECT 
    c.id,
    c.contract_number,
    c.status,
    c.total_amount,
    u.full_name as creator_name,
    u.email as creator_email,
    c.created_at
FROM translation_contracts c
LEFT JOIN users u ON c.created_by_id = u.id
ORDER BY c.created_at DESC
LIMIT 10;
