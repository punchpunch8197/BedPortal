import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Download, ChevronLeft, Calendar, FileText, Monitor, Command, Terminal, AlertTriangle } from 'lucide-react';
import InstallerModal from '../components/InstallerModal';
import { fetchAppById } from '../api/apps';
import './AppDetail.css';

const AppDetail = () => {
    const { id } = useParams();
    const [showInstaller, setShowInstaller] = useState(false);
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadApp = async () => {
            try {
                setLoading(true);
                const data = await fetchAppById(id);
                setApp(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadApp();
    }, [id]);

    if (loading) {
        return (
            <div className="app-detail-page container">
                <div className="loading-state">Loading app...</div>
            </div>
        );
    }

    if (error || !app) {
        return (
            <div className="app-detail-page container">
                <Link to="/" className="back-link">
                    <ChevronLeft size={20} />
                    <span>Back to Store</span>
                </Link>
                <div className="error-state">App not found</div>
            </div>
        );
    }

    return (
        <div className="app-detail-page container">
            <Link to="/" className="back-link">
                <ChevronLeft size={20} />
                <span>Back to Store</span>
            </Link>

            <div className="app-header-grid">
                <div className="app-icon-large">
                    <img src={app.icon} alt={app.name} />
                </div>

                <div className="app-info-main">
                    <h1>{app.name}</h1>
                    <p className="category">{app.category}</p>

                    <div className="metrics">
                        <div className="metric">
                            <Star size={18} fill="currentColor" className="star-icon" />
                            <span className="value">{app.rating}</span>
                            <span className="label">{app.reviews ? `${app.reviews} Reviews` : 'No Reviews'}</span>
                        </div>
                        <div className="metric">
                            <div className="os-icons">
                                {app.osSupport?.includes('windows') && <Monitor size={16} />}
                                {app.osSupport?.includes('mac') && <Command size={16} />}
                                {app.osSupport?.includes('linux') && <Terminal size={16} />}
                            </div>
                            <span className="label">Supported OS</span>
                        </div>
                    </div>

                    <div className="action-row">
                        <button className="btn-download" onClick={() => setShowInstaller(true)}>
                            <Download size={20} />
                            <span>Get App</span>
                        </button>
                    </div>

                    <div className="unverified-warning">
                        <AlertTriangle size={16} />
                        <span>This app is not verified. Download at your own risk.</span>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                <div className="main-col">
                    <section className="screenshots">
                        {app.screenshots?.map((src, i) => (
                            <img key={i} src={src} alt={`Screenshot ${i + 1}`} className="screenshot" />
                        ))}
                    </section>

                    <section className="description">
                        <h2>About this app</h2>
                        <p>{app.description}</p>
                    </section>
                </div>

                <div className="sidebar-col">
                    <div className="info-box">
                        <h3>Information</h3>
                        <div className="info-row">
                            <Calendar size={16} />
                            <span>Updated: {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        <div className="info-row">
                            <FileText size={16} />
                            <span>Version: {app.version || '1.0.0'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showInstaller && (
                <InstallerModal app={app} onClose={() => setShowInstaller(false)} />
            )}
        </div>
    );
};

export default AppDetail;
