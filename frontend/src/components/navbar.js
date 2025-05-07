import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';

function NavBar() {
    return ( <div>
    <h1 className='mt-5 main-header'>JournalAI</h1>
    <nav className='navbar navbar-light mb-5'>
        <div className='container d-flex justify-content-center'>
            <div className="d-flex gap-3">
                <Link className='btn btn-dark' to='/Summarize'>Summarizer</Link>
                <Link className='btn btn-dark' to='/saved'>Saved Entries</Link>
                <Link className='btn btn-dark' to='/settings'>Settings</Link>
                <LogoutButton />
            </div>
        </div>
    </nav> 
    </div> )
}

export default NavBar;
