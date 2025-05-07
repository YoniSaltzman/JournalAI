import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FetchWithAuth from '../utils/fetchwithauth';

function Saved() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('yummy', localStorage.getItem('token'));
                const res = await FetchWithAuth('http://localhost:8000/getsaved', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json', 
                    },
                }, navigate);
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }

                const data = await res.json();
                console.log('saved entries', data)
                setEntries(Array.isArray(data) ? data : []);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch saved entries:', err);
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);

        const handleDelete = async (entryId) => {
            const token = localStorage.getItem('token');
            const res = await FetchWithAuth(`http://localhost:8000/deletesaved/${entryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }, navigate);
       

            const data = await res.json();

            if (res.ok) {
                // Update the UI (remove entry from state and remove button)
                setEntries(prevEntries => prevEntries.filter(eachEntry => eachEntry.id !== entryId))
                console.log(data.detail);

            } else {
                console.error(data.detail);
            }
        };
    // 
    if (loading) return <p>loading...</p>; 
    
    else if (entries) {
        return (
            <div>
                <h4 className='mt-3'>Your Saved Entries and Summaries</h4>
                <table className='table table-striped table-bordered container'>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Entry</th>
                        <th>Summary</th>
                        <th>Date</th>
                        <th>Delete</th>
                    </tr>
                    </thead>
                    <tbody className='table-hover'>

                    {Array.isArray(entries) && entries.map((entry, index) => {
                    const formattedDate = new Date(entry.date_created).toLocaleDateString();
                    return (
                        <tr key={entry.id}>
                            <td>{index + 1}</td>
                            <td>{entry.entry}</td>
                            <td>{entry.summary}</td>
                            <td>{formattedDate}</td>
                            <td><button className='btn btn-dark' onClick={() => handleDelete(entry.id)}>Delete</button></td>
                        </tr>
                        );

                    })}
                    </tbody>
                </table>
            </div>
            );
    } else {
    return (
        <div>
            <h2>No Saved Entries or Summaries yet</h2>
            <p>Start journaling, summarizing, and saving and they will appear here!</p>
        </div>
    )}
}

export default Saved;