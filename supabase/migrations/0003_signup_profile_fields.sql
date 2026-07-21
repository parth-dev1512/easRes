-- Capture full_name and phone (passed via auth.signUp's options.data) into
-- the profile row created for every new user, instead of leaving them null
-- until the user fills in the CV editor by hand.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
