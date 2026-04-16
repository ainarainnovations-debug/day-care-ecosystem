UPDATE public.invite_codes 
SET used_by = '80a7aa9b-96f0-412f-a672-e47a1413dbc6', 
    used_at = now(), 
    is_active = false 
WHERE code = 'TEACH-2026' AND used_by IS NULL;