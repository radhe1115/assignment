import React, { useState, useEffect } from 'react';

const TransactionTable = ({ month }) => {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // Function to fetch transactions from the API
    const fetchTransactions = () => {
        setLoading(true);
        fetch(`/api/transactions?month=${month}&search=${search}&page=${page}&perPage=${perPage}`)
            .then(res => res.json())
            .then(data => {
                setTransactions(data.transactions);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching transactions:', err);
                setLoading(false);
            });
    };

    // UseEffect to fetch transactions when the component mounts or the month/search/page changes
    useEffect(() => {
        fetchTransactions();
    }, [month, search, page, perPage]);

    // Function to handle search input
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    // Function to handle removing duplicates
    const handleRemoveDuplicates = () => {
        fetch(`/api/remove-duplicates`, { method: 'POST' })
            .then(res => res.json())
            .then(() => {
                alert('Duplicates removed successfully');
                fetchTransactions(); // Refresh transactions after duplicates are removed
            })
            .catch(err => {
                console.error('Error removing duplicates:', err);
            });
    };

    return (
        <div>
            <div>
                <input 
                    type="text" 
                    placeholder="Search transaction" 
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Sold</th>
                        <th>Image</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="7">Loading...</td></tr>
                    ) : transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td>{transaction.id}</td>
                                <td>{transaction.title}</td>
                                <td>{transaction.description}</td>
                                <td>{transaction.price}</td>
                                <td>{transaction.category}</td>
                                <td>{transaction.sold ? "Yes" : "No"}</td>
                                <td><img src={transaction.image} alt={transaction.title} width="50" /></td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="7">No transactions found</td></tr>
                    )}
                </tbody>
            </table>
            
            {/* Pagination controls */}
            <div>
                <button onClick={() => setPage(page > 1 ? page - 1 : 1)} disabled={page === 1}>Previous</button>
                <span>Page: {page}</span>
                <button onClick={() => setPage(page + 1)}>Next</button>
            </div>
            
            {/* Remove Duplicates Button */}
            <div>
                <button onClick={handleRemoveDuplicates}>Remove Duplicates</button>
            </div>
        </div>
    );
};

export default TransactionTable;
