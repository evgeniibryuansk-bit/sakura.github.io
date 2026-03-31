create or replace function public.normalize_profile_role_array(input_roles text[])
returns text[]
language sql
immutable
as $$
  with raw_roles as (
    select
      lower(regexp_replace(trim(role), '[[:space:]]+', ' ', 'g')) as normalized_role,
      lower(regexp_replace(trim(role), '[^[:alnum:]]+', '', 'g')) as compact_role
    from unnest(coalesce(input_roles, array[]::text[])) as role
  ),
  canonical_roles as (
    select distinct
      case
        when normalized_role = '' then null
        when normalized_role ~ '^co([[:space:]_-])*owner$' or compact_role = 'coowner'
          then 'co-owner'
        when compact_role in ('root', 'r00t', 'owner')
          then 'root'
        when compact_role in ('superadministrator', 'superadmin')
          then 'super administrator'
        when compact_role in ('admin', 'administrator')
          then 'administrator'
        when compact_role = 'moderator'
          then 'moderator'
        when compact_role in ('support', 'supp0rt')
          then 'support'
        when compact_role in ('sponsor', 'ponsor', 'sponor', 'ponor', 'sp0ns0r', 'p0n0r')
          then 'sponsor'
        when compact_role = 'tester'
          then 'tester'
        when compact_role = 'subscriber'
          then null
        when compact_role = 'user'
          then 'user'
        else normalized_role
      end as role
    from raw_roles
    where normalized_role <> ''
  ),
  ordered_roles as (
    select role
    from canonical_roles
    where role is not null
    order by
      case role
        when 'root' then 0
        when 'co-owner' then 1
        when 'super administrator' then 2
        when 'administrator' then 3
        when 'moderator' then 4
        when 'support' then 5
        when 'sponsor' then 6
        when 'tester' then 7
        when 'user' then 8
        else 99
      end,
      role asc
  )
  select coalesce(array_agg(role), array['user']::text[])
  from ordered_roles;
$$;

create or replace function public.admin_set_profile_ban_rpc(
  target_profile_id bigint,
  target_is_banned boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor_auth_user_id uuid := auth.uid();
  actor_profile public.profiles%rowtype;
  target_profile public.profiles%rowtype;
  actor_roles text[] := array[]::text[];
  target_roles text[] := array[]::text[];
  actor_is_root boolean := false;
  actor_is_co_owner boolean := false;
  target_is_root boolean := false;
  next_is_banned boolean := coalesce(target_is_banned, false);
  next_banned_at timestamptz := case
    when coalesce(target_is_banned, false) then timezone('utc', now())
    else null
  end;
begin
  if actor_auth_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if target_profile_id is null or target_profile_id <= 0 then
    raise exception 'Target profile id is required.';
  end if;

  select *
  into actor_profile
  from public.profiles
  where auth_user_id = actor_auth_user_id
  limit 1;

  if actor_profile.profile_id is null then
    raise exception 'Actor profile not found.';
  end if;

  select *
  into target_profile
  from public.profiles
  where profile_id = target_profile_id
  limit 1;

  if target_profile.profile_id is null then
    return null;
  end if;

  actor_roles := public.normalize_profile_role_array(coalesce(actor_profile.roles, array[]::text[]));
  target_roles := public.normalize_profile_role_array(coalesce(target_profile.roles, array[]::text[]));
  actor_is_root := coalesce('root' = any(actor_roles), false);
  actor_is_co_owner := coalesce('co-owner' = any(actor_roles), false);
  target_is_root := coalesce('root' = any(target_roles), false);

  if not actor_is_root and not actor_is_co_owner then
    raise exception 'Only root and co-owner accounts can update the ban status.';
  end if;

  if actor_is_co_owner and not actor_is_root and target_is_root then
    raise exception 'Co-owner cannot manage root accounts.';
  end if;

  if actor_profile.profile_id = target_profile.profile_id and next_is_banned then
    raise exception 'You cannot ban your own account.';
  end if;

  update public.profiles
  set
    is_banned = next_is_banned,
    banned_at = next_banned_at,
    updated_at = timezone('utc', now())
  where profile_id = target_profile.profile_id
  returning * into target_profile;

  return jsonb_build_object(
    'profileId', target_profile.profile_id,
    'authUserId', target_profile.auth_user_id,
    'firebaseUid', target_profile.firebase_uid,
    'email', target_profile.email,
    'emailVerified', target_profile.email_verified,
    'verificationRequired', target_profile.verification_required,
    'verificationEmailSent', target_profile.verification_email_sent,
    'login', target_profile.login,
    'displayName', target_profile.display_name,
    'photoURL', target_profile.photo_url,
    'avatarPath', target_profile.avatar_path,
    'avatarType', target_profile.avatar_type,
    'avatarSize', target_profile.avatar_size,
    'roles', coalesce(target_profile.roles, array[]::text[]),
    'isBanned', target_profile.is_banned,
    'bannedAt', target_profile.banned_at,
    'providerIds', coalesce(target_profile.provider_ids, array[]::text[]),
    'loginHistory', coalesce(target_profile.login_history, '[]'::jsonb),
    'visitHistory', coalesce(target_profile.visit_history, '[]'::jsonb),
    'creationTime', target_profile.created_at,
    'updatedAt', target_profile.updated_at,
    'lastSignInTime', target_profile.last_sign_in_at
  );
end;
$$;

create or replace function public.admin_update_profile_roles_rpc(
  target_profile_id bigint,
  target_roles text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor_auth_user_id uuid := auth.uid();
  actor_profile public.profiles%rowtype;
  target_profile public.profiles%rowtype;
  actor_roles text[] := array[]::text[];
  current_target_roles text[] := array[]::text[];
  next_roles text[] := public.normalize_profile_role_array(target_roles);
  actor_is_root boolean := false;
  actor_is_co_owner boolean := false;
  target_is_root boolean := false;
begin
  if actor_auth_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if target_profile_id is null or target_profile_id <= 0 then
    raise exception 'Target profile id is required.';
  end if;

  select *
  into actor_profile
  from public.profiles
  where auth_user_id = actor_auth_user_id
  limit 1;

  if actor_profile.profile_id is null then
    raise exception 'Actor profile not found.';
  end if;

  select *
  into target_profile
  from public.profiles
  where profile_id = target_profile_id
  limit 1;

  if target_profile.profile_id is null then
    return null;
  end if;

  actor_roles := public.normalize_profile_role_array(coalesce(actor_profile.roles, array[]::text[]));
  current_target_roles := public.normalize_profile_role_array(coalesce(target_profile.roles, array[]::text[]));
  actor_is_root := coalesce('root' = any(actor_roles), false);
  actor_is_co_owner := coalesce('co-owner' = any(actor_roles), false);
  target_is_root := coalesce('root' = any(current_target_roles), false);

  if not actor_is_root and not actor_is_co_owner then
    raise exception 'Only root and co-owner accounts can update roles.';
  end if;

  if actor_is_co_owner and not actor_is_root and target_is_root then
    raise exception 'Co-owner cannot manage root accounts.';
  end if;

  if not actor_is_root and coalesce('root' = any(next_roles), false) then
    raise exception 'Only root can assign the root role.';
  end if;

  update public.profiles
  set
    roles = next_roles,
    updated_at = timezone('utc', now())
  where profile_id = target_profile.profile_id
  returning * into target_profile;

  return jsonb_build_object(
    'profileId', target_profile.profile_id,
    'authUserId', target_profile.auth_user_id,
    'firebaseUid', target_profile.firebase_uid,
    'email', target_profile.email,
    'emailVerified', target_profile.email_verified,
    'verificationRequired', target_profile.verification_required,
    'verificationEmailSent', target_profile.verification_email_sent,
    'login', target_profile.login,
    'displayName', target_profile.display_name,
    'photoURL', target_profile.photo_url,
    'avatarPath', target_profile.avatar_path,
    'avatarType', target_profile.avatar_type,
    'avatarSize', target_profile.avatar_size,
    'roles', coalesce(target_profile.roles, array[]::text[]),
    'isBanned', target_profile.is_banned,
    'bannedAt', target_profile.banned_at,
    'providerIds', coalesce(target_profile.provider_ids, array[]::text[]),
    'loginHistory', coalesce(target_profile.login_history, '[]'::jsonb),
    'visitHistory', coalesce(target_profile.visit_history, '[]'::jsonb),
    'creationTime', target_profile.created_at,
    'updatedAt', target_profile.updated_at,
    'lastSignInTime', target_profile.last_sign_in_at
  );
end;
$$;

grant execute on function public.normalize_profile_role_array(text[]) to authenticated;
grant execute on function public.admin_set_profile_ban_rpc(bigint, boolean) to authenticated;
grant execute on function public.admin_update_profile_roles_rpc(bigint, text[]) to authenticated;
revoke all on function public.normalize_profile_role_array(text[]) from anon;
revoke all on function public.admin_set_profile_ban_rpc(bigint, boolean) from anon;
revoke all on function public.admin_update_profile_roles_rpc(bigint, text[]) from anon;
