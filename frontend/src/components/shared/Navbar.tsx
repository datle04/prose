'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, clearAuth } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.push('/');
    };

    return (
        <nav className="border-b border-border bg-background sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="font-heading text-xl font-bold text-primary">
                    MyBlog
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            {(user.role === 'AUTHOR' || user.role === 'ADMIN') && (
                                <Link
                                    href="/dashboard"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Dashboard
                                </Link>
                            )}
                            {user.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                href={`/profile/${user.username}`}
                                className="text-sm font-medium hover:text-primary transition-colors"
                            >
                                {user.name}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
