import { jwtDecode } from 'jwt-decode';

function isTokenExpired(token) {
    if (!token) return true;
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
}

export default isTokenExpired;