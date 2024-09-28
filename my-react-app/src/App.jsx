import React, { useState } from 'react';
import Papa from 'papaparse'; // Import papaparse for CSV parsing
import './CreateOrder.css';

const CreateOrder = () => {
    const [distributorName, setDistributorName] = useState('');
    const [orderNo, setOrderNo] = useState('');
    const [totalQty, setTotalQty] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [products, setProducts] = useState([]);

    // Parse and handle CSV upload
    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    const parsedProducts = result.data.map(row => ({
                        code: row["Product Code"] || '',          // Use the CSV column name 'Product Code'
                        description: row["Description"] || '',    // Use the CSV column name 'Description'
                        minOrderQty: row["MOQ"] || 0,             // Use the CSV column name 'MOQ'
                        price: row["Price"] || 0,                 // Use the CSV column name 'Price'
                        quantityOrdered: row["Quantity Ordered"] || 0, // Use the CSV column name 'Quantity Ordered'
                        totalValue: (row["Quantity Ordered"] || 0) * (row["Price"] || 0),
                    }));

                    // Update products state with CSV data
                    setProducts(parsedProducts);

                    // Update total quantity and total value
                    const totalQty = parsedProducts.reduce((sum, product) => sum + Number(product.quantityOrdered), 0);
                    const totalValue = parsedProducts.reduce((sum, product) => sum + product.totalValue, 0);
                    setTotalQty(totalQty);
                    setTotalValue(totalValue);
                }
            });
        }
    };

    const handleQuantityChange = (index, newQty) => {
        const updatedProducts = products.map((product, i) => {
            if (i === index) {
                const updatedProduct = { ...product, quantityOrdered: newQty, totalValue: newQty * product.price };
                return updatedProduct;
            }
            return product;
        });

        setProducts(updatedProducts);

        const totalQty = updatedProducts.reduce((sum, product) => sum + Number(product.quantityOrdered), 0);
        const totalValue = updatedProducts.reduce((sum, product) => sum + product.totalValue, 0);

        setTotalQty(totalQty);
        setTotalValue(totalValue);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle the order submission
        console.log('Order submitted', { distributorName, orderNo, totalQty, totalValue, products });
    };

    return (
        <div className="create-order-container">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="navbar-brand">Acme Corp</div>
                <ul className="nav-links">
                    <li>Dashboard</li>
                    <li>Orders</li>
                    <li>Inventory</li>
                    <li>Customers</li>
                    <li>Products</li>
                    <li>Reports</li>
                    <li><img src="assets/dummy.jpg" alt="Profile" className="profile-pic" /></li>
                </ul>
            </nav>

            <h2>Create an Order</h2>
            <form onSubmit={handleSubmit} className="order-form">
                <h3>Step 1: Upload an Order Template</h3>
                <a href="/order_template.csv" download>
                    <button type="button">Download Template</button>
                </a>

                <input type="file" accept=".csv" onChange={handleCSVUpload} />

                <h3>Step 2: Review and Edit Your Order</h3>
                <input
                    type="text"
                    placeholder="Distributor Name"
                    value={distributorName}
                    onChange={(e) => setDistributorName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Order No."
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                />
                <div className="totals">
                    <p>Total Quantity: {totalQty}</p>
                    <p>Total Value: ${totalValue.toFixed(2)}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Product Code</th>
                            <th>Description</th>
                            <th>MOQ</th>
                            <th>Price</th>
                            <th>Quantity Ordered</th>
                            <th>Total Value</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={index}>
                                <td>{product.code}</td>
                                <td>{product.description}</td>
                                <td>{product.minOrderQty}</td>
                                <td>${product.price}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={product.quantityOrdered}
                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    />
                                </td>
                                <td>${product.totalValue.toFixed(2)}</td>
                                <td><button type="button">Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="6">Total</td>
                            <td>${totalValue.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <h3>Step 3: Submit Your Order</h3>
                <textarea placeholder="Special Instructions" />

                <button type="submit">Submit Order</button>
            </form>
        </div>
    );
};

export default CreateOrder;
