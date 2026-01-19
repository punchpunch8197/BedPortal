import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Monitor, Command, Terminal, Image as ImageIcon, Save, AlertCircle, Package } from 'lucide-react';
import { createApp } from '../api/apps';
import './CreatorForm.css';

const CreatorForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        category: 'Utilities',
        description: '',
        license: '',
        version: '1.0.0',
        osSupport: { windows: false, mac: false, linux: false },
        thumbnail: null,
        screenshots: [],
        appFile: null
    });

    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOsChange = (os) => {
        setFormData(prev => ({
            ...prev,
            osSupport: { ...prev.osSupport, [os]: !prev.osSupport[os] }
        }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, thumbnail: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAppFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, appFile: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Validate required app file
        if (!formData.appFile) {
            setError('App file is required. Please upload your application.');
            setSubmitting(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('category', formData.category);
            submitData.append('description', formData.description);
            submitData.append('license', formData.license);
            submitData.append('version', formData.version);

            const osSupport = Object.entries(formData.osSupport)
                .filter(([_, enabled]) => enabled)
                .map(([os]) => os);
            submitData.append('osSupport', JSON.stringify(osSupport));

            if (formData.thumbnail) {
                submitData.append('icon', formData.thumbnail);
            }

            submitData.append('appFile', formData.appFile);

            const newApp = await createApp(submitData);
            navigate(`/app/${newApp.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="creator-container">
            <div className="form-header">
                <h1>Create Store Page</h1>
                <p>Publish your app to the BedPortal ecosystem.</p>
            </div>

            <form onSubmit={handleSubmit} className="creator-form">

                {/* Basic Info Section */}
                <section className="form-section">
                    <h2>Basic Information</h2>
                    <div className="form-group">
                        <label>App Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Sleep Tracker Pro"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleInputChange}>
                            <option>Utilities</option>
                            <option>Games</option>
                            <option>Productivity</option>
                            <option>Health & Fitness</option>
                            <option>Education</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Tell us about your app..."
                            rows={4}
                        />
                    </div>
                </section>

                {/* Media Section */}
                <section className="form-section">
                    <h2>Visuals</h2>
                    <div className="form-group">
                        <label>App Icon / Thumbnail</label>
                        <div className="thumbnail-upload-area">
                            <input type="file" id="thumb-upload" onChange={handleThumbnailChange} accept="image/*" hidden />
                            <div className="preview-box">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="thumb-preview" />
                                ) : (
                                    <ImageIcon size={48} className="placeholder-icon" />
                                )}
                            </div>
                            <label htmlFor="thumb-upload" className="upload-btn">
                                <Upload size={16} />
                                <span>Upload Icon</span>
                            </label>
                        </div>
                        <p className="help-text">Recommended size: 512x512px</p>
                    </div>
                </section>

                {/* Technical Section */}
                <section className="form-section">
                    <h2>Technical Details</h2>
                    <div className="form-group">
                        <label>Supported Platforms</label>
                        <div className="os-checkboxes">
                            <label className={`os-chk ${formData.osSupport.windows ? 'checked' : ''}`}>
                                <input type="checkbox" checked={formData.osSupport.windows} onChange={() => handleOsChange('windows')} />
                                <Monitor size={20} />
                                <span>Windows</span>
                            </label>
                            <label className={`os-chk ${formData.osSupport.mac ? 'checked' : ''}`}>
                                <input type="checkbox" checked={formData.osSupport.mac} onChange={() => handleOsChange('mac')} />
                                <Command size={20} />
                                <span>macOS</span>
                            </label>
                            <label className={`os-chk ${formData.osSupport.linux ? 'checked' : ''}`}>
                                <input type="checkbox" checked={formData.osSupport.linux} onChange={() => handleOsChange('linux')} />
                                <Terminal size={20} />
                                <span>Linux</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Version</label>
                        <input
                            type="text"
                            name="version"
                            value={formData.version}
                            onChange={handleInputChange}
                            placeholder="1.0.0"
                        />
                    </div>

                    <div className="form-group">
                        <label>License & EULA</label>
                        <textarea
                            name="license"
                            value={formData.license}
                            onChange={handleInputChange}
                            placeholder="Paste your software license agreement here..."
                            rows={6}
                            className="monospace-input"
                        />
                        <div className="warning-note">
                            <AlertCircle size={14} />
                            <span>This text will be shown in the installer before download.</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>App File <span className="required">*</span></label>
                        <div className={`file-upload-area ${formData.appFile ? 'has-file' : ''}`}>
                            <input type="file" id="app-file-upload" onChange={handleAppFileChange} hidden />
                            <label htmlFor="app-file-upload" className="upload-btn">
                                <Package size={16} />
                                <span>{formData.appFile ? formData.appFile.name : 'Upload App File'}</span>
                            </label>
                        </div>
                        <p className="help-text">Upload your application (.app, .zip, .dmg, .exe)</p>
                    </div>
                </section>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={submitting}>
                        <Save size={20} />
                        <span>{submitting ? 'Publishing...' : 'Publish Store Page'}</span>
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreatorForm;
