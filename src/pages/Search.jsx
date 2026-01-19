import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppCard from '../components/AppCard';
import { fetchApps } from '../api/apps';
import './Search.css';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) {
            setApps([]);
            return;
        }

        const searchApps = async () => {
            try {
                setLoading(true);
                const data = await fetchApps({ q: query });
                setApps(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        searchApps();
    }, [query]);

    return (
        <div className="search-page container">
            <h1>Search Results</h1>
            <p className="search-query">
                {query ? `Results for "${query}"` : 'Enter a search term to find apps'}
            </p>

            {loading && <div className="loading-state">Searching...</div>}

            {error && <div className="error-state">Error: {error}</div>}

            {!loading && !error && apps.length === 0 && query && (
                <div className="empty-state">No apps found matching "{query}"</div>
            )}

            {!loading && !error && apps.length > 0 && (
                <div className="search-results">
                    <p className="results-count">{apps.length} app(s) found</p>
                    <div className="app-grid">
                        {apps.map(app => (
                            <AppCard key={app.id} app={app} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
