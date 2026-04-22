'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types';

const notifIcon: Record<Notification['type'], string> = {
    LIKE: '♥',
    COMMENT: '💬',
    REPLY: '↩',
    FOLLOW: '👤',
};

export default function NotificationBell() {
    const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-8 w-80 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <span className="text-sm font-semibold">Notifications</span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllRead()}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No notifications yet
                                </p>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.isRead && markOneRead(n.id)}
                                        className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                                            !n.isRead ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <span className="text-base mt-0.5">{notifIcon[n.type]}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm leading-5">{n.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
