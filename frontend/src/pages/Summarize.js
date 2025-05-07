import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import "../css/summarize.css";
import FetchWithAuth from '../utils/fetchwithauth';

function JournalForm() {
    const [userEntry, setUserEntry] = useState('');
    const [returnedSummary, setReturnedSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const navigate = useNavigate();

    // load an entry draft if drafted and user navigated to different page and then returned
    useEffect(() => {
        const savedEntry = localStorage.getItem('draftEntry');
        const savedSummary = localStorage.getItem('draftSummary');
        if (savedEntry) {
            setUserEntry(savedEntry);
        }
        if (savedSummary) {
            setReturnedSummary(savedSummary);
        }
    }, []);


    const handleEntryChange = (e) => {
        setUserEntry(e.target.value);
        localStorage.setItem('draftEntry', e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

    const response = await FetchWithAuth('http://localhost:8000/summarize', {
        method: 'POST',
        body: JSON.stringify({ entry: userEntry }),
    }, navigate);

    if (!response) return;

    const data = await response.json();
    setLoading(false);
    if (data.error) {
        alert(data.error)
    } else {
    setReturnedSummary(data.returnedSummary)
    localStorage.setItem('draftSummary', data.returnedSummary)
    console.log(returnedSummary);
    }

};

const handleSave = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log('token:', token)
        const res = await fetch('http://localhost:8000/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ entry: userEntry, summary: returnedSummary })
        });
        if (!res.ok) {
            throw new Error(`HTTP Error! status ${res.status}`);
        }
        const data = await res.json();
        setSaveMessage('Entry saved');
        setTimeout(() => setSaveMessage(''), 2000)
        console.log('Entry saved:', data);
    } catch (error) {
        console.error('Error saving entry:', error);
        setTimeout(() => setSaveMessage(''), 2000);
        console.error('Error saving entry:', error);
    }
};

const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
}

return (
    <div className='container' >
    <h4>write a journal entry and have it summarized with AI</h4>
    <form className='d-flex flex-column justify-content-center' onSubmit={handleSubmit}>
        <textarea
            className='form-control mb-2 text-center'
            value={userEntry}
            onChange={handleEntryChange}
            placeholder='Write your journal entry here!'
            style={{ minHeight: '100px', resize: 'none' }}
            onKeyDown={handleTextareaKeyDown}
        />
        <button className='btn btn-dark' type='submit'>Summarize it!</button>
    </form>

    {loading && (
        <div className='text-center my-3'>
            <div className='spinner-border text-dark' role='status'>
                <span className='visually-hidden'>Loading...</span>
            </div>
            <div>Generating summary...</div>
        </div>
    )}
    {returnedSummary && !loading && (
        <div className="border rounded p-3 mt-3">
            <h2>summary</h2>
            <ReactMarkdown>{returnedSummary}</ReactMarkdown>
            <button className='btn btn-dark' onClick={handleSave}>Save</button>
            {saveMessage && (
                <div>{saveMessage}</div>
            )}
        </div>
    )}
    </div>
);
}

export default JournalForm