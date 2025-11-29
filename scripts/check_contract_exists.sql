-- Check if contract with ID = 3 exists
SELECT 
    id,
    contract_number,
    status,
    total_amount,
    created_at,
    created_by_id
FROM translation_contracts 
WHERE id = 3
ORDER BY created_at DESC;

-- If not found, show available contracts
SELECT 
    id,
    contract_number,
    status,
    total_amount,
    created_at
FROM translation_contracts 
ORDER BY id ASC
LIMIT 10;
