import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, Menu } from 'lucide-react';
import './Header.css';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="header">
            <div className="header-container container">
                <Link to="/" className="logo">
                    BedPortal
                </Link>

                <form onSubmit={handleSearch} className="search-bar">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search for apps..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <nav className="nav-links">
                    <Link to="/create" className="nav-item">
                        <Upload size={20} />
                        <span>Upload App</span>
                    </Link>
                    <button className="mobile-menu-btn">
                        <Menu size={24} />
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
