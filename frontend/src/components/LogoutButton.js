import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // clear token
        localStorage.removeItem('draftSummary');
        localStorage.removeItem('draftEntry')
        navigate('/Login');

    };
    return (
        <button className='btn btn-dark' onClick={handleLogout}>
            Logout
        </button>
    );
}

export default LogoutButton;