import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../src/services/api';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    timestamp: string;
    read: boolean;
}

const typeColors: Record<string, string> = {
    weather: '#3B82F6',
    market: '#10B981',
    advisory: '#F59E0B',
    pest: '#EF4444',
};

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Fetch notifications on mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await api.getNotifications();
                if (data.success && data.notifications?.length) {
                    setNotifications(data.notifications);
                } else {
                    // Fallback demo data if backend returns empty or fails
                    setNotifications(getFallbackNotifications());
                }
            } catch {
                setNotifications(getFallbackNotifications());
            }
        };
        fetchNotifications();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const timeAgo = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="relative" ref={ref}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="relative flex items-center justify-center w-10 h-10 bg-[#FAFAF7] border border-[#E6E6E6] rounded-full hover:bg-[#E8F5E9] transition-all"
                title="Notifications"
            >
                <Bell size={18} className="text-[#043744]" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#E6E6E6] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6E6E6] bg-[#FAFAF7]">
                        <h3 className="text-sm font-extrabold text-[#1E1E1E]">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-[11px] font-bold text-[#043744] hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-[#999]">No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`flex gap-3 px-4 py-3 border-b border-[#F0F0F0] last:border-b-0 transition-colors ${n.read ? 'bg-white' : 'bg-[#F0FFF4]'
                                        }`}
                                >
                                    <div
                                        className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: typeColors[n.type] || '#999' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-[#1E1E1E] leading-tight">{n.title}</p>
                                        <p className="text-[12px] text-[#555] mt-0.5 leading-snug">{n.message}</p>
                                        <p className="text-[10px] text-[#999] mt-1 font-semibold">{timeAgo(n.timestamp)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

function getFallbackNotifications(): Notification[] {
    const now = new Date().toISOString();
    return [
        { id: 1, title: '🌧️ Severe weather alert', message: 'Heavy rainfall expected in your area.', type: 'weather', timestamp: now, read: false },
        { id: 2, title: '📈 MSP Update', message: 'Wheat prices increased by ₹150/quintal.', type: 'market', timestamp: now, read: false },
        { id: 3, title: '🌱 Crop Advisory', message: 'Ideal time to sow Rabi crops.', type: 'advisory', timestamp: now, read: false },
        { id: 4, title: '🐛 Pest Alert', message: 'Brown planthopper activity reported nearby.', type: 'pest', timestamp: now, read: false },
    ];
}

export default NotificationBell;
