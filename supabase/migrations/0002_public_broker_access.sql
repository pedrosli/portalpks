-- Corretores não fazem mais login: a busca (/imoveis) e o detalhe do imóvel
-- passam a ser públicos, mas só devem expor imóveis com status = 'available'.
-- O admin continua enxergando tudo (via is_admin()), inclusive os alugados,
-- no painel /admin.
--
-- Rodar este arquivo no SQL Editor do Supabase, depois do 0001_init.sql.

drop policy if exists properties_select on public.properties;
create policy properties_select_public on public.properties
  for select using (status = 'available' or public.is_admin());

drop policy if exists property_photos_select on public.property_photos;
create policy property_photos_select_public on public.property_photos
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.properties p
      where p.id = property_photos.property_id
        and p.status = 'available'
    )
  );

drop policy if exists property_photos_storage_select on storage.objects;
create policy property_photos_storage_select_public on storage.objects
  for select using (
    bucket_id = 'property-photos'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.property_photos pp
        join public.properties p on p.id = pp.property_id
        where pp.path = storage.objects.name
          and p.status = 'available'
      )
    )
  );
