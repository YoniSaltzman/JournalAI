import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [ValidatePassword, setValidatePassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password})
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            navigate('/Summarize');
        } else {
            const errorData = await res.json();
            // Update UI to show error message
            setError(errorData.detail);
        }
    } catch (error) {
        setError('Registration failed. Please try again. ');
    }
};


    return (
        <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <h1 className='mt-5 main-header'>JournalAI</h1>
            <form onSubmit={handleRegister} className="d-flex flex-column w-100" style={{ maxWidth: '350px' }}>
                {error && (
                    <div className='alert alert-danger mb-3'>
                        {error}
                    </div>
                )}
                <input value={username} onChange={(e) => {
                    // Remove spaces from input
                    const value = e.target.value.replace(/\s+/g, '');
                    setUsername(value)}
                    } placeholder='Username' className="form-control mb-2 text-center" />
                <input value={password}
                type='password' 
                onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordStrength(zxcvbn(e.target.value));
                }} 
                placeholder='Password' 
                className="form-control mb-2 text-center" 
                />
                <div className='password-strength-feedback my-1' style={{
                    fontSize: '0.9rem',
                    color: '#666',
                }}>
                    {passwordStrength && (
                        <div className='mb-1'>
                            <div className='me-2'>Strength:</div>
                            <div className='progress' style={{height: '5px', backgroundColor: '#e9ecef'}}>
                                <div className={`progress-bar ${passwordStrength.score >= 3 ? 'bg-success' : passwordStrength.score >= 2 ? 'bg-warning' : 'bg-danger'}`}
                                role='progressbar'
                                style={{ width: `${(passwordStrength.score + 1) * 25}%`}}> 
                                </div>
                            </div>
                            {passwordStrength.score}/4
                            {passwordStrength.score <= 2 && (
                                <div className='text-danger mt-1'>Password is too weak. Please use a stronger password
                                </div> 
                            )}
                            {passwordStrength.score >= 3 && (
                                <div className='text-success mt-1'>Password is strong!
                                </div> 
                            )}                            
                        </div>
                        )}
                </div>
                <input value={ValidatePassword} type='password' onChange={(e) => setValidatePassword(e.target.value)} placeholder='Validate Password' className="form-control mb-2 text-center" />
                <button
                    type='submit' 
                    className='btn btn-dark w-100 mb-2'
                    disabled={!passwordStrength || passwordStrength.score <= 2}
                    >Register</button>
            </form>
            <p className="mt-2">Already have an account? <Link to='/login'>Login!!!</Link></p>
        </div>
    )
}

export default Register