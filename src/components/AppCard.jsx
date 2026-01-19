import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import './AppCard.css';

// Simple OS Icons component
const OSIcon = ({ os }) => {
    // In a real app, use proper SVGs or an icon library
    if (os === 'windows') return <span title="Windows" className="os-badge win">Win</span>;
    if (os === 'mac') return <span title="macOS" className="os-badge mac">Mac</span>;
    if (os === 'linux') return <span title="Linux" className="os-badge linux">Lin</span>;
    return null;
};

const AppCard = ({ app }) => {
    return (
        <Link to={`/app/${app.id}`} className="app-card-link">
            <div className="app-card">
                <div className="app-icon-wrapper">
                    <img src={app.icon || "https://via.placeholder.com/128"} alt={app.name} className="app-icon" />
                </div>
                <div className="app-content">
                    <h3 className="app-name">{app.name}</h3>
                    <p className="app-category">{app.category}</p>

                    <div className="app-meta">
                        <div className="rating">
                            <Star size={14} fill="currentColor" />
                            <span>{app.rating}</span>
                        </div>
                        <div className="os-support">
                            {app.osSupport && app.osSupport.map(os => <OSIcon key={os} os={os} />)}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default AppCard;
