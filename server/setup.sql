-- Query Builder Database Setup
-- Create database (run this separately as superuser)
-- CREATE DATABASE query_builder;

-- Connect to query_builder database and run the rest

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    total DECIMAL(10, 2) NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic devices and gadgets'),
    ('Home & Kitchen', 'Home and kitchen items'),
    ('Books', 'Books and educational materials'),
    ('Sports', 'Sports and outdoor equipment'),
    ('Clothing', 'Clothing and accessories')
ON CONFLICT DO NOTHING;

INSERT INTO users (name, email, created_at) VALUES
    ('John Doe', 'john@example.com', '2023-01-15'),
    ('Jane Smith', 'jane@example.com', '2023-02-20'),
    ('Bob Johnson', 'bob@example.com', '2023-03-10'),
    ('Alice Brown', 'alice@example.com', '2023-04-05'),
    ('Charlie Wilson', 'charlie@example.com', '2023-05-12'),
    ('Diana Ross', 'diana@example.com', '2023-06-18'),
    ('Frank Miller', 'frank@example.com', '2023-07-22'),
    ('Grace Lee', 'grace@example.com', '2023-08-30'),
    ('Henry Ford', 'henry@example.com', '2023-09-14'),
    ('Ivy Chen', 'ivy@example.com', '2023-10-25')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, price, category_id, description) VALUES
    ('Laptop', 1299.99, 1, 'High-performance laptop'),
    ('Smartphone', 699.99, 1, 'Latest smartphone'),
    ('Tablet', 399.99, 1, 'Portable tablet'),
    ('Headphones', 199.99, 1, 'Wireless headphones'),
    ('Coffee Maker', 89.99, 2, 'Automatic coffee maker'),
    ('Blender', 79.99, 2, 'High-speed blender'),
    ('Microwave', 149.99, 2, 'Countertop microwave'),
    ('Programming Guide', 49.99, 3, 'Complete programming guide'),
    ('Data Science Book', 59.99, 3, 'Data science fundamentals'),
    ('Running Shoes', 119.99, 4, 'Professional running shoes'),
    ('Yoga Mat', 29.99, 4, 'Premium yoga mat'),
    ('T-Shirt', 19.99, 5, 'Cotton t-shirt'),
    ('Jeans', 59.99, 5, 'Denim jeans')
ON CONFLICT DO NOTHING;

INSERT INTO orders (user_id, product_id, quantity, total, order_date) VALUES
    (1, 1, 1, 1299.99, '2023-06-01'),
    (1, 4, 2, 399.98, '2023-06-15'),
    (2, 2, 1, 699.99, '2023-06-02'),
    (2, 12, 3, 59.97, '2023-06-20'),
    (3, 3, 1, 399.99, '2023-06-03'),
    (3, 8, 1, 49.99, '2023-06-25'),
    (4, 5, 1, 89.99, '2023-06-04'),
    (4, 6, 1, 79.99, '2023-07-01'),
    (5, 7, 1, 149.99, '2023-06-05'),
    (5, 11, 2, 59.98, '2023-07-10'),
    (6, 9, 1, 59.99, '2023-06-06'),
    (6, 10, 1, 119.99, '2023-07-15'),
    (7, 1, 1, 1299.99, '2023-06-07'),
    (7, 13, 2, 119.98, '2023-07-20'),
    (8, 2, 1, 699.99, '2023-06-08'),
    (8, 5, 1, 89.99, '2023-08-01'),
    (9, 3, 1, 399.99, '2023-06-09'),
    (9, 4, 1, 199.99, '2023-08-05'),
    (10, 6, 1, 79.99, '2023-06-10'),
    (10, 7, 1, 149.99, '2023-08-10'),
    (1, 8, 2, 99.98, '2023-08-15'),
    (2, 9, 1, 59.99, '2023-08-20'),
    (3, 10, 1, 119.99, '2023-08-25'),
    (4, 11, 1, 29.99, '2023-09-01'),
    (5, 12, 4, 79.96, '2023-09-05'),
    (6, 13, 1, 59.99, '2023-09-10'),
    (7, 2, 1, 699.99, '2023-09-15'),
    (8, 1, 1, 1299.99, '2023-09-20'),
    (9, 5, 1, 89.99, '2023-09-25'),
    (10, 3, 1, 399.99, '2023-09-30')
ON CONFLICT DO NOTHING;

-- Create some useful views
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id,
    o.order_date,
    u.name as customer_name,
    u.email as customer_email,
    p.name as product_name,
    c.name as category_name,
    o.quantity,
    o.total,
    p.price as unit_price
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN products p ON o.product_id = p.id
JOIN categories c ON p.category_id = c.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Display summary
SELECT 'Database setup completed successfully!' as message;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT 'Sample data counts:' as info;
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;
