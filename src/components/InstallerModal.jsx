import React, { useState, useEffect } from 'react';
import { X, Check, Monitor, Command, Terminal, Download, FileText, AlertTriangle, FolderOpen } from 'lucide-react';
import './InstallerModal.css';

const STEPS = {
    OS_SELECTION: 0,
    LICENSE: 1,
    INSTALLING: 2,
    COMPLETED: 3
};

const InstallerModal = ({ app, onClose }) => {
    const [step, setStep] = useState(STEPS.OS_SELECTION);
    const [selectedOS, setSelectedOS] = useState(null);
    const [progress, setProgress] = useState(0);
    const [downloadComplete, setDownloadComplete] = useState(false);

    // Auto-detect OS
    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('win') > -1) setSelectedOS('windows');
        else if (userAgent.indexOf('mac') > -1) setSelectedOS('mac');
        else if (userAgent.indexOf('linux') > -1) setSelectedOS('linux');
    }, []);

    const downloadFile = async () => {
        if (!app.filePath) return false;

        const downloadUrl = `/api/apps/${app.id}/download`;

        try {
            // Try File System Access API (allows saving to Applications folder)
            if ('showSaveFilePicker' in window) {
                // Fetch the file first
                const response = await fetch(downloadUrl);
                if (!response.ok) throw new Error('Download failed');

                const blob = await response.blob();

                // Get filename
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = `${app.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?([^"]+)"?/);
                    if (match) filename = match[1];
                }

                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        startIn: 'desktop',
                        types: [{
                            description: 'Application',
                            accept: {
                                'application/octet-stream': ['.app', '.zip', '.dmg', '.exe', '.pkg']
                            }
                        }]
                    });

                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();

                    return true;
                } catch (pickerError) {
                    if (pickerError.name === 'AbortError') {
                        return false; // User cancelled
                    }
                    throw pickerError;
                }
            }

            // Fallback: use iframe for download (avoids blob URL navigation)
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = downloadUrl;
            document.body.appendChild(iframe);

            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 5000);

            return true;
        } catch (error) {
            console.error('Download failed:', error);
            return false;
        }
    };

    const handleInstall = () => {
        setStep(STEPS.INSTALLING);

        let prog = 0;
        const interval = setInterval(() => {
            prog += Math.random() * 15;

            if (prog >= 100) {
                prog = 100;
                clearInterval(interval);
                setTimeout(() => setStep(STEPS.COMPLETED), 500);
            }
            setProgress(prog);
        }, 300);
    };

    const handleFinish = async () => {
        if (app.filePath) {
            const success = await downloadFile();
            setDownloadComplete(success);
            // Only close if download was successful or no file
            if (success) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const getOSIcon = (os) => {
        switch (os) {
            case 'windows': return <Monitor size={24} />;
            case 'mac': return <Command size={24} />;
            case 'linux': return <Terminal size={24} />;
            default: return <Download size={24} />;
        }
    };

    // Dummy License Text
    const licenseText = `END USER LICENSE AGREEMENT

By proceeding with the installation of "${app.name}", you agree to the following terms:

1. USE: You may use this software for personal purposes.
2. DISTRIBUTION: You may not redistribute this software without permission.
3. LIABILITY: The author is not liable for any damages caused by this software (e.g., if you fall asleep at your keyboard).

WARNING: This software may induce extreme relaxation. Do not operate heavy machinery while using.`;

    return (
        <div className="modal-overlay">
            <div className="modal-content installer-window">
                <div className="installer-header">
                    <div className="window-controls">
                        <span className="control close" onClick={onClose}></span>
                        <span className="control minimize"></span>
                        <span className="control maximize"></span>
                    </div>
                    <span className="window-title">BedPortal Installer - {app.name}</span>
                </div>

                <div className="installer-body">
                    {step === STEPS.OS_SELECTION && (
                        <div className="step-content">
                            <h2>Select Your Bed (OS)</h2>
                            <p>Where would you like to install {app.name}?</p>

                            <div className="os-options">
                                {['windows', 'mac', 'linux'].map(os => (
                                    <button
                                        key={os}
                                        className={`os-btn ${selectedOS === os ? 'selected' : ''} ${!app.osSupport?.includes(os) ? 'disabled' : ''}`}
                                        onClick={() => app.osSupport?.includes(os) && setSelectedOS(os)}
                                        disabled={!app.osSupport?.includes(os)}
                                    >
                                        {getOSIcon(os)}
                                        <span>{os.charAt(0).toUpperCase() + os.slice(1)}</span>
                                        {!app.osSupport?.includes(os) && <span className="unsupported-tag">Unsupported</span>}
                                    </button>
                                ))}
                            </div>

                            <div className="actions">
                                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                                <button
                                    className="btn-primary"
                                    disabled={!selectedOS}
                                    onClick={() => setStep(STEPS.LICENSE)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {step === STEPS.LICENSE && (
                        <div className="step-content">
                            <h2>License Agreement</h2>
                            <div className="license-box">
                                <FileText size={16} className="license-icon" />
                                <pre>{licenseText}</pre>
                            </div>

                            <div className="warning-box">
                                <AlertTriangle size={16} />
                                <span>Please review carefully before accepting.</span>
                            </div>

                            <div className="actions">
                                <button className="btn-secondary" onClick={() => setStep(STEPS.OS_SELECTION)}>Back</button>
                                <button className="btn-primary" onClick={handleInstall}>I Accept & Install</button>
                            </div>
                        </div>
                    )}

                    {step === STEPS.INSTALLING && (
                        <div className="step-content centered">
                            <h2>Installing...</h2>
                            <p>Tucking {app.name} in...</p>

                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="progress-text">{Math.round(progress)}%</span>
                        </div>
                    )}

                    {step === STEPS.COMPLETED && (
                        <div className="step-content centered">
                            <div className="success-icon">
                                <Check size={48} />
                            </div>
                            <h2>Ready to Install!</h2>
                            {app.filePath ? (
                                <p>Click the button below to save {app.name} to your preferred location.</p>
                            ) : (
                                <p className="no-file-warning">No download file available for this app.</p>
                            )}

                            <div className="actions">
                                <button className="btn-primary" onClick={handleFinish}>
                                    <FolderOpen size={16} />
                                    <span>Save to Applications</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstallerModal;
