import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const CentralAdminDashboard = () => {
    const [consolidatedOrders, setConsolidatedOrders] = useState({});
    const [distributors, setDistributors] = useState([]);
    const [availableStock, setAvailableStock] = useState([]);
    const [reconciliationData, setReconciliationData] = useState([]);

    useEffect(() => {
        const fetchConsolidatedOrders = async () => {
            try {
                const response = await axios.get('http://localhost:1234/api/consolidated-orders');
                setConsolidatedOrders(response.data);

                // Extract distributor names
                const distributorNames = new Set();
                Object.values(response.data).forEach(item => {
                    Object.keys(item.totals).forEach(name => distributorNames.add(name));
                });
                setDistributors(Array.from(distributorNames));
            } catch (error) {
                console.error('Error fetching consolidated orders:', error);
            }
        };

        fetchConsolidatedOrders();
    }, []);

    // Handle CSV file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    updateAvailableStock(results.data);
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                },
            });
        }
    };

    // Update available stock based on uploaded data
    const updateAvailableStock = (data) => {
        const stockMap = {};
        data.forEach(item => {
            stockMap[item['Product Code']] = {
                description: item['Product Description'],
                available: Number(item['Available Stock']),
            };
        });
        setAvailableStock(stockMap);
        calculateReconciliation(stockMap);
    };

    // Calculate reconciliation
    const calculateReconciliation = (stockMap) => {
        const reconciledData = Object.entries(consolidatedOrders).map(([code, item]) => {
            const totalOrdered = Object.values(item.totals).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
            const availableStockData = stockMap[code] || { available: 0, description: '' };
            const available = availableStockData.available;
            const netPosition = available - totalOrdered;

            return {
                code,
                description: availableStockData.description || item.description, // Fallback to item description from orders
                totalOrdered,
                available,
                netPosition,
            };
        });

        setReconciliationData(reconciledData);
    };

    return (
        <div>
            <h2>Central Admin Order Management</h2>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
            <table>
                <thead>
                    <tr>
                        <th>Product Code</th>
                        <th>Product Description</th>
                        {distributors.map((distributor, index) => (
                            <th key={index}>{distributor}</th>
                        ))}
                        <th>Total Ordered</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(consolidatedOrders).map(([code, item]) => {
                        const totalOrdered = Object.values(item.totals).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
                        return (
                            <tr key={code}>
                                <td>{code}</td>
                                <td>{item.description}</td>
                                {distributors.map((distributor) => (
                                    <td key={distributor}>{item.totals[distributor] || 0}</td>
                                ))}
                                <td>{totalOrdered}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <h3>Stock Reconciliation</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product Code</th>
                        <th>Product Description</th>
                        <th>Total Ordered</th>
                        <th>Available Stock</th>
                        <th>Net Position</th>
                    </tr>
                </thead>
                <tbody>
                    {reconciliationData.map(({ code, description, totalOrdered, available, netPosition }) => (
                        <tr key={code}>
                            <td>{code}</td>
                            <td>{description}</td>
                            <td>{totalOrdered}</td>
                            <td>{available}</td>
                            <td>{netPosition >= 0 ? `+${netPosition}` : netPosition}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CentralAdminDashboard;
