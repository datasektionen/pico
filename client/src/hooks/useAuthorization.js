import axios from 'axios';
import { useEffect, useState } from 'react'
import Configuration from '../configuration';

// Hook that runs once on application mount. Checks the token (if any) and sets admin status and loading status
const useAuthorization = () => {
    const [pls, setPls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setHasToken(true)
        axios.get(`${Configuration.apiUrl}/api/check-token`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => setPls(res.data.pls))
        .catch(res => {
            setHasToken(false)
            setPls([])
        })
        .finally(() => setLoading(false))
    }, [])

    return { pls, loading, hasToken }
}

export default useAuthorization;