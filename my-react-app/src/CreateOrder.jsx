import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import './CreateOrder.css';
import { Link } from 'react-router-dom';

const CreateOrder = () => {
    const [distributorName, setDistributorName] = useState('');
    const [orderNo, setOrderNo] = useState('');
    const [totalQty, setTotalQty] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [products, setProducts] = useState([]);

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    const parsedProducts = result.data.map(row => ({
                        code: row["Product Code"] || '',
                        description: row["Description"] || '',
                        minOrderQty: Number(row["MOQ"]) || 0,
                        price: parseFloat(row["Price"]) || 0,
                        quantityOrdered: parseInt(row["Quantity Ordered"], 10) || 0,
                        totalValue: (Number(row["Quantity Ordered"]) || 0) * (Number(row["Price"]) || 0),
                        isEditing: false,
                    }));

                    setProducts(parsedProducts);

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
                const updatedQty = Number(newQty);
                return { ...product, quantityOrdered: updatedQty, totalValue: updatedQty * product.price };
            }
            return product;
        });

        setProducts(updatedProducts);
        updateTotals(updatedProducts);
    };

    const handleEditToggle = (index) => {
        const updatedProducts = products.map((product, i) =>
            i === index
                ? { ...product, isEditing: !product.isEditing }
                : product
        );

        // If switching from editing to non-editing, update the totals
        if (updatedProducts[index].isEditing) {
            updateTotals(updatedProducts);
        }
        
        setProducts(updatedProducts);
    };

    const handleInputChange = (index, field, value) => {
        const updatedProducts = products.map((product, i) => {
            if (i === index) {
                const updatedProduct = {
                    ...product,
                    [field]: field === 'price' || field === 'minOrderQty' || field === 'quantityOrdered'
                        ? parseFloat(value) || 0
                        : value
                };
                updatedProduct.totalValue = updatedProduct.price * updatedProduct.quantityOrdered; // Recalculate total value
                return updatedProduct;
            }
            return product;
        });
        
        setProducts(updatedProducts);
        updateTotals(updatedProducts);
    };

    const updateTotals = (updatedProducts) => {
        const newTotalQty = updatedProducts.reduce((sum, product) => sum + Number(product.quantityOrdered), 0);
        const newTotalValue = updatedProducts.reduce((sum, product) => sum + product.totalValue, 0);
        setTotalQty(newTotalQty);
        setTotalValue(newTotalValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!distributorName.trim()) {
            alert('Distributor Name is required.');
            return;
        }
        if (!orderNo.trim()) {
            alert('Order No. is required.');
            return;
        }
        if (products.length === 0) {
            alert('You must upload a CSV file with products.');
            return;
        }

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            if (!product.code || !product.description || product.minOrderQty <= 0 || product.price <= 0 || product.quantityOrdered <= 0) {
                alert(`Product fields cannot be empty or zero. Please check product ${i + 1}.`);
                return;
            }
        }

        const orderData = {
            distributorName,
            orderNo,
            totalQty,
            totalValue,
            products
        };

        try {
            const response = await axios.post('http://localhost:1234/api/orders', orderData);
            if (response.status === 200) {
                alert('Order submitted successfully');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to submit order');
        }
    };

    return (
        <div className="create-order-container">
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
            <Link to="/central-admin-orders">
                <button type="button">Go to Central Admin Order Management</button>
            </Link>
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
                                {product.isEditing ? (
                                    <>
                                        <td><input type="text" value={product.code} onChange={(e) => handleInputChange(index, 'code', e.target.value)} /></td>
                                        <td><input type="text" value={product.description} onChange={(e) => handleInputChange(index, 'description', e.target.value)} /></td>
                                        <td><input type="number" value={product.minOrderQty} onChange={(e) => handleInputChange(index, 'minOrderQty', e.target.value)} /></td>
                                        <td><input type="number" value={product.price} onChange={(e) => handleInputChange(index, 'price', e.target.value)} /></td>
                                        <td><input type="number" value={product.quantityOrdered} onChange={(e) => handleInputChange(index, 'quantityOrdered', e.target.value)} /></td>
                                        <td>${(product.price * product.quantityOrdered).toFixed(2)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>{product.code}</td>
                                        <td>{product.description}</td>
                                        <td>{product.minOrderQty}</td>
                                        <td>${Number(product.price).toFixed(2)}</td>
                                        <td>{product.quantityOrdered}</td>
                                        <td>${product.totalValue.toFixed(2)}</td>
                                    </>
                                )}
                                <td>
                                    <button type="button" onClick={() => handleEditToggle(index)}>
                                        {product.isEditing ? 'Save' : 'Edit'}
                                    </button>
                                </td>
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
                <button type="submit">Submit Order</button>
            </form>
        </div>
    );
};

export default CreateOrder;
