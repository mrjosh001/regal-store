create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'whatsapp_initiated' check (status in ('whatsapp_initiated', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  currency text not null default 'NGN',
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  selected_image_url text,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
on public.orders for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own order items" on public.order_items;
create policy "Users can view their own order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
  )
);

create or replace function public.create_customer_order(p_items jsonb, p_total numeric)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_order_id uuid;
  item jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;
  if p_total is null or p_total < 0 then
    raise exception 'Invalid order total';
  end if;

  insert into public.orders (user_id, status, total)
  values (auth.uid(), 'whatsapp_initiated', p_total)
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity,
      size, color, selected_image_url, image_urls
    )
    values (
      new_order_id,
      nullif(item->>'product_id', '')::uuid,
      coalesce(nullif(item->>'product_name', ''), 'Product'),
      coalesce((item->>'unit_price')::numeric, 0),
      greatest(coalesce((item->>'quantity')::integer, 1), 1),
      nullif(item->>'size', ''),
      nullif(item->>'color', ''),
      nullif(item->>'selected_image_url', ''),
      coalesce(array(select jsonb_array_elements_text(coalesce(item->'image_urls', '[]'::jsonb))), '{}')
    );
  end loop;

  return new_order_id;
end;
$$;

revoke execute on function public.create_customer_order(jsonb, numeric) from public, anon;
grant execute on function public.create_customer_order(jsonb, numeric) to authenticated;
