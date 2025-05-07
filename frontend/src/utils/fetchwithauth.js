import isTokenExpired from './authUtils';

async function FetchWithAuth(url, options = {}, navigate) {
    const token = localStorage.getItem('token');

    if (!token || isTokenExpired(token)) {
        // No token or expired
        localStorage.removeItem('token');
        navigate('/login', {state: { message: 'session-expired'} });
        return;
    }

    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (res.status === 401) {
        // Token was invalid or expired after sending
        localStorage.removeItem('token');
        navigate('/login', {state: { message: 'session-expired'} });
        return;
    }

    return res;
}

export default FetchWithAuth