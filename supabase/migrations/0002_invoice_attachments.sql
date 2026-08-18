-- Invoice attachment storage.
-- Uploads are performed by the backend with the service-role key only; there
-- are no storage policies granting anon/authenticated write access, so the
-- bucket is write-protected. The bucket is public for read access (demo scope;
-- tenant-scoped policies or signed URLs are follow-up hardening).

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', true)
on conflict (id) do nothing;

-- Fix camelCase column names: 0001 declared them unquoted, so Postgres folded
-- them to lowercase (invoicenumber/bookingid/fileurl), breaking the
-- pass-through API bodies. Rename to exact camelCase.
alter table public.invoices rename column bookingid    to "bookingId";
alter table public.invoices rename column invoicenumber to "invoiceNumber";
alter table public.invoices rename column fileurl       to "fileUrl";