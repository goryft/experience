-- Insert initial categories
insert into public.categories (name, description)
values
    ('T-Shirts', 'Comfortable and stylish t-shirts for everyday wear'),
    ('Hoodies', 'Warm and cozy hoodies for colder days'),
    ('Pants', 'Versatile pants for various occasions'),
    ('Accessories', 'Complementary items to complete your look');

-- Insert standard sizes
insert into public.sizes (name, display_order)
values
    ('XS', 1),
    ('S', 2),
    ('M', 3),
    ('L', 4),
    ('XL', 5),
    ('2XL', 6),
    ('3XL', 7);

-- Insert a sample product
insert into public.products (name, description, price, category_id)
values (
    'Sample T-Shirt',
    'A comfortable and stylish t-shirt for everyday wear',
    29.99,
    (select id from public.categories where name = 'T-Shirts')
);

-- Insert inventory for the sample product
insert into public.inventory (product_id, size_id, quantity)
select 
    p.id,
    s.id,
    10
from public.products p
cross join public.sizes s
where p.name = 'Sample T-Shirt'
and s.name in ('S', 'M', 'L', 'XL'); 