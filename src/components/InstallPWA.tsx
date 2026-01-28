import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './InstallPWA.css';

export default function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
            setIsVisible(true);
        };
        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!promptInstall) {
            return;
        }
        await promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            toast.success('Sedang menginstal aplikasi...');
            setIsVisible(false);
        }
    };

    const handleLater = () => {
        setIsVisible(false);
        toast('Aplikasi dapat diinstal nanti melalui menu browser', {
            duration: 4000
        });
    };

    if (!supportsPWA || !isVisible) {
        return null;
    }

    return (
        <div className="pwa-install-toast">
            <div className="pwa-header">
                <div className="pwa-icon-box">
                    <Download size={24} />
                </div>
                <div className="pwa-content">
                    <h3>Install Resik Artha</h3>
                    <p>Akses lebih cepat dan gunakan secara offline!</p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="pwa-close"
                    aria-label="Tutup"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="pwa-actions">
                <button
                    onClick={handleInstall}
                    className="pwa-btn pwa-btn-primary"
                >
                    Instal Sekarang
                </button>
                <button
                    onClick={handleLater}
                    className="pwa-btn pwa-btn-secondary"
                >
                    Nanti
                </button>
            </div>
        </div>
    );
}
