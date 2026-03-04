'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AdminContextType = {
    isAdmin: boolean;
    toggleAdmin: () => void;
};

const AdminContext = createContext<AdminContextType>({
    isAdmin: false,
    toggleAdmin: () => { },
});

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('isAdmin');
        if (saved === 'true') setIsAdmin(true);
    }, []);

    const toggleAdmin = () => {
        if (isAdmin) {
            // Logging out
            setIsAdmin(false);
            localStorage.setItem('isAdmin', 'false');
        } else {
            // Logging in
            const passcode = prompt('Enter Admin Passcode:');
            if (passcode === 'admin123') {
                setIsAdmin(true);
                localStorage.setItem('isAdmin', 'true');
            } else if (passcode !== null) {
                alert('Incorrect passcode!');
            }
        }
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <AdminContext.Provider value={{ isAdmin: false, toggleAdmin }}>
                <div className="invisible">{children}</div>
            </AdminContext.Provider>
        );
    }

    return (
        <AdminContext.Provider value={{ isAdmin, toggleAdmin }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
