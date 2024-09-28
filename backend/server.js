const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 1234;

app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'newuser',         // Replace with your MySQL username
    password: 'Vedant@123', // Replace with your MySQL password
    database: 'order_management'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// API route to handle order submission
app.post('/api/orders', (req, res) => {
    const { distributorName, orderNo, totalQty, totalValue, products } = req.body;

    const insertOrderQuery = `INSERT INTO orders (distributor_name, order_no, total_qty, total_value) VALUES (?, ?, ?, ?)`;
    db.query(insertOrderQuery, [distributorName, orderNo, totalQty, totalValue], (err, result) => {
        if (err) {
            console.error('Error inserting order:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const orderId = result.insertId;

        const insertProductQuery = `INSERT INTO products (order_id, code, description, min_order_qty, price, quantity_ordered, total_value) VALUES ?`;
        const productValues = products.map(product => [
            orderId,
            product.code,
            product.description,
            product.minOrderQty,
            product.price,
            product.quantityOrdered,
            product.totalValue
        ]);

        db.query(insertProductQuery, [productValues], (err) => {
            if (err) {
                console.error('Error inserting products:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(200).json({ message: 'Order and products saved successfully' });
        });
    });
});


// API route to get consolidated orders
app.get('/api/consolidated-orders', (req, res) => {
    const query = `
        SELECT 
            p.code AS product_code,
            p.description AS product_description,
            o.distributor_name,
            SUM(p.quantity_ordered) AS total_ordered
        FROM 
            products p
        JOIN 
            orders o ON p.order_id = o.id
        GROUP BY 
            p.code, p.description, o.distributor_name
        ORDER BY 
            p.code, o.distributor_name
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching consolidated orders:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Process results into a matrix format
        const consolidatedData = {};
        
        results.forEach(row => {
            if (!consolidatedData[row.product_code]) {
                consolidatedData[row.product_code] = {
                    description: row.product_description,
                    totals: {}
                };
            }
            consolidatedData[row.product_code].totals[row.distributor_name] = row.total_ordered;
        });

        res.status(200).json(consolidatedData);
    });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
