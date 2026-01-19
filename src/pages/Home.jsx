import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import AppCard from '../components/AppCard';
import { fetchApps } from '../api/apps';
import './Home.css';

const Home = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadApps = async () => {
            try {
                setLoading(true);
                const data = await fetchApps();
                setApps(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadApps();
    }, []);

    if (loading) {
        return (
            <div className="home-page container">
                <div className="loading-state">Loading apps...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-page container">
                <div className="error-state">Error: {error}</div>
            </div>
        );
    }

    const featuredApps = apps.slice(0, 3);
    const recentApps = apps.slice(0, 5);

    return (
        <div className="home-page container">
            <div className="warning-banner">
                <AlertTriangle size={20} />
                <p>
                    <strong>Warning:</strong> Apps on this store are not verified.
                    Download only from trusted sources. We are not responsible for any damages.
                </p>
            </div>

            <section className="hero-section">
                <div className="hero-content">
                    <h1>Discover Apps for your Digital Bed</h1>
                    <p>The coziest place to find software. Cross-platform, secure, and always ready for you.</p>
                </div>
            </section>

            <section className="apps-section">
                <h2 className="section-title">Featured Apps</h2>
                <div className="app-grid">
                    {featuredApps.map(app => (
                        <AppCard key={app.id} app={app} />
                    ))}
                </div>
            </section>

            <section className="apps-section">
                <h2 className="section-title">Recent Uploads</h2>
                <div className="app-grid">
                    {recentApps.map(app => (
                        <AppCard key={`recent-${app.id}`} app={app} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
