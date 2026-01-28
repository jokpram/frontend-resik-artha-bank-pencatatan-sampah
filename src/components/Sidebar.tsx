import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface SidebarProps {
    menuItems: MenuItem[];
    activeTab: string;
    setActiveTab: (id: string) => void;
    title?: string;
}

export default function Sidebar({ menuItems, activeTab, setActiveTab, title = "Menu" }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className="sidebar" style={{
            width: isCollapsed ? '80px' : '260px',
            background: 'white',
            borderRight: '1px solid var(--border)',
            height: 'calc(100vh - 64px)', // Adjust based on navbar height
            position: 'sticky',
            top: '64px',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1rem',
            transition: 'width 0.3s ease',
            flexShrink: 0
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                marginBottom: '2rem',
                paddingLeft: isCollapsed ? '0' : '0.75rem'
            }}>
                {!isCollapsed && (
                    <h3 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        margin: 0
                    }}>
                        {title}
                    </h3>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            title={isCollapsed ? item.label : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: isActive ? '#ECFDF5' : 'transparent',
                                color: isActive ? '#059669' : 'var(--text-muted)',
                                fontWeight: isActive ? '600' : '400',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                width: '100%',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <div style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>
                                <item.icon size={20} />
                            </div>
                            {!isCollapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
