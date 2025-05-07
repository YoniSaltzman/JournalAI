import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useLinkClickHandler } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [expiredMessage, setExpiredMessage] = useState('');
    const navigate = useNavigate();

    const location = useLocation();

    const message = location.state?.message;
    useEffect(() => {
        console.log('login mounted, message:', message)
        if (message === 'session-expired') {
            setExpiredMessage('Session Expired, please log in again')
        }
    }, [message]);

    const handleLogin = async (e) => {
            e.preventDefault();

            const res = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username, password})
            });
            
            if (res.ok) {
            const data = await res.json();

            localStorage.setItem('token', data.access_token);
            console.log(data.access_token)
            navigate('/Summarize')
            } else {
                console.error('Login Failed')
            }
        }

    return (
        <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <h1 className='mt-5 main-header'>JournalAI</h1>
            {expiredMessage && (
                <div className='alert alert-danger mt-1'>
                    {expiredMessage}
                </div>
            )}
            <form onSubmit={handleLogin} className="d-flex flex-column w-100" style={{ maxWidth: '350px' }}>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' className="form-control mb-2 text-center" />
                <input value={password} type='password' onChange={(e) => setPassword(e.target.value)} placeholder='Password' className="form-control mb-2 text-center" />
                <button type='submit' className='btn btn-dark w-100 mb-2'>Login</button>
            </form>
            <p className="mt-2">Don't have an account yet? <Link to='/register'>Register here!!!</Link></p>
        </div>
    )
}
    

export default Login