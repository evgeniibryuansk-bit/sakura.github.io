create or replace function public.resolve_legacy_profile_recovery(target_identifier text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_identifier text := trim(coalesce(target_identifier, ''));
  normalized_login text := lower(regexp_replace(normalized_identifier, '\s+', '', 'g'));
  target_profile record;
begin
  if normalized_identifier = '' then
    return null;
  end if;

  if position('@' in normalized_identifier) > 0 then
    select
      profile_id,
      auth_user_id,
      firebase_uid,
      email,
      login,
      display_name
    into target_profile
    from public.profiles
    where email is not null
      and lower(email) = lower(normalized_identifier)
    order by profile_id asc
    limit 1;
  else
    select
      profile_id,
      auth_user_id,
      firebase_uid,
      email,
      login,
      display_name
    into target_profile
    from public.profiles
    where login is not null
      and lower(login) = normalized_login
    order by profile_id asc
    limit 1;
  end if;

  if target_profile.profile_id is null then
    return null;
  end if;

  return jsonb_build_object(
    'profileId', target_profile.profile_id,
    'email', target_profile.email,
    'login', target_profile.login,
    'displayName', target_profile.display_name,
    'hasAuthUser', target_profile.auth_user_id is not null,
    'needsActivation', target_profile.auth_user_id is null,
    'isLegacyProfile',
      target_profile.auth_user_id is null
      and nullif(trim(coalesce(target_profile.firebase_uid, '')), '') is not null,
    'canActivateWithEmail',
      target_profile.auth_user_id is null
      and nullif(trim(coalesce(target_profile.email, '')), '') is not null
  );
end;
$$;

grant execute on function public.resolve_legacy_profile_recovery(text) to anon, authenticated;
revoke all on function public.resolve_legacy_profile_recovery(text) from public;
