SELECT *
FROM private.admin_users;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'private'
  AND table_name = 'admin_users';

  SELECT
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'is_admin'
ORDER BY routine_schema;

SELECT pg_get_functiondef(
    'private.is_admin()'::regprocedure
);


-- SCENTIE: Public wrapper for admin authorization

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
    SELECT private.is_admin();
$function$;

-- Only authenticated users may check admin status.
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


SELECT
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'is_admin'
ORDER BY routine_schema;

INSERT INTO private.admin_users (user_id)
VALUES ('073464ee-26ec-40e8-87ad-bdf927123fb0');