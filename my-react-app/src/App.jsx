import React, { useState } from 'react';
import './CreateOrder.css';

const CreateOrder = () => {
   const [distributorName, setDistributorName] = useState('');
   const [country, setCountry] = useState('');
   const [city, setCity] = useState('');
   const [orderNo, setOrderNo] = useState('');
   const [products, setProducts] = useState([
       { code: '1234', description: 'Widget 1', minOrderQty: 10, price: 15, quantityOrdered: 20 },
       { code: '5678', description: 'Widget 2', minOrderQty: 5, price: 10, quantityOrdered: 50 },
       { code: '9101', description: 'Widget 3', minOrderQty: 15, price: 20, quantityOrdered: 30 },
   ]);

   const handleSubmit = (e) => {
       e.preventDefault();
       console.log('Order submitted', { distributorName, country, city, orderNo, products });
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
               <button type="button">Download Template</button>
               <input type="file" />

               <h3>Step 2: Review and Edit Your Order</h3>
               <input
                   type="text"
                   placeholder="Distributor Name"
                   value={distributorName}
                   onChange={(e) => setDistributorName(e.target.value)}
               />
               <input
                   type="text"
                   placeholder="Country"
                   value={country}
                   onChange={(e) => setCountry(e.target.value)}
               />
               <input
                   type="text"
                   placeholder="City"
                   value={city}
                   onChange={(e) => setCity(e.target.value)}
               />
               <input
                   type="text"
                   placeholder="Order No."
                   value={orderNo}
                   onChange={(e) => setOrderNo(e.target.value)}
               />

               <table>
                   <thead>
                       <tr>
                           <th>Product Code</th>
                           <th>Description</th>
                           <th>Minimum Order Quantity</th>
                           <th>Price</th>
                           <th>Quantity Ordered</th>
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
                               <td>{product.quantityOrdered}</td>
                               <td><button type="button">Edit</button></td>
                           </tr>
                       ))}
                   </tbody>
               </table>

               <h3>Step 3: Submit Your Order</h3>
               <textarea placeholder="Special Instructions" />

               <button type="submit">Submit Order</button>
           </form>
       </div>
   );
};

export default CreateOrder;
