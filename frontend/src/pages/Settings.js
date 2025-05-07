import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import FetchWithAuth from "../utils/fetchwithauth";

function Settings() {
    const [userName, setUserName] = useState('');
    const [userAge, setUserAge] = useState(0);
    const [userStyle, setUserStyle] = useState('');
    const [userMemories, setUserMemories] = useState(false);
    const [userAboutMe, setUserAboutMe] = useState('');
    const [hasSettings, setHasSettings] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSettings = async () => {
            const res = await FetchWithAuth('http://localhost:8000/settings', 
                navigate);

            if (res.status === 204) {
                // No content, no settings exist yet
                setHasSettings(false);
            } else {
                const data = await res.json();
                if (data) {
                    setUserName(data.name);
                    setUserAge(data.age);
                    setUserStyle(data.style);
                    setUserMemories(data.memories);
                    setUserAboutMe(data.about_me)
                    setHasSettings(true); // we now know settings exist and make PUT requests
                }
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            saveSettings();
        }, 1000);
        return () => clearTimeout(timeout);
    }, [userName, userAge, userStyle, userMemories, userAboutMe]);

    const saveSettings = async () => {
        const method = hasSettings ? 'PUT' : 'POST';
        const res = await FetchWithAuth('http://localhost:8000/settings', {
            method: method,
               body: JSON.stringify(
                {
                name: userName,
                age: userAge,
                style: userStyle,
                memories: userMemories,
                about_me: userAboutMe
                }
               )
    
            }, navigate);
            if (!res.ok) {
                throw new Error('failed to fetch');
            } else {
                if (!hasSettings) setHasSettings(true); // update hasSettings for future saves
            }
            console.log(res.json);
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        await saveSettings();
        setSaveMessage('settings saved');
        setTimeout(() => setSaveMessage(''), 2000);
    };



        return (
            <div className="container">
                <h4 className="mt-3">Fill out settings and details for better Summaries</h4>
                <form onSubmit={handleSubmit} className="d-flex flex-column">
                    <label className="fw-bold" htmlFor="name-field">Name:</label>
                    <input value={userName} onChange={(e) => setUserName(e.target.value)} id="name-field" type="text" className="form-control mb-2 text-center" />

                    <label className="fw-bold" htmlFor="age-field">Age:</label>
                    <input value={userAge} onChange={(e) => setUserAge(parseInt(e.target.value))} id="age-field" type="number" className="form-control mb-2 text-center" />

                    <label className="fw-bold" htmlFor="writing-style">Writing Style</label>
                    <select value={userStyle} onChange={(e) => setUserStyle(e.target.value)} id="writing-style" className="form-control mb-2 text-center">
                        <option>--Select a style--</option>
                        <option value={'casual'}>Casual</option>
                        <option value={'concise'}>Concise</option>
                        <option value={'funny'}>Funny</option>
                        <option value={'reflective'}>Reflective</option>
                        <option value={'prolific'}>Prolific</option>
                        <option value={'analytical'}>Analytical</option>
                    </select>

                    <label className="fw-bold" htmlFor="include-memories">Include Memories:</label>
                    <p className="fw-bold mb-2">(let JournalAI see your previous entries in order to create even more personalized summaries)</p>
                    <input classname="form-check-input" style={{ transform: 'scale(1.5)' }} checked={userMemories} onChange={(e) => setUserMemories(e.target.checked)} id="include-memories" type="checkbox" className="mb-2" />

                    <label className="fw-bold" htmlFor="about-me">About me (Write a sentence or 2 about yourself or personality!)</label>
                    <input value={userAboutMe} onChange={(e) => setUserAboutMe(e.target.value)} id="about-me" type="text" className="form-control mb-2 text-center" />
                    <button type="submit" className="btn btn-dark">Save</button>
                    {saveMessage && (
                        <div>{saveMessage}</div>
                    )}
                </form>
            </div>
        )
    }

export default Settings
