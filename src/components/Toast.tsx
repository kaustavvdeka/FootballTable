'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    messages: ToastMessage[];
    removeToast: (id: string) => void;
}

export default function ToastContainer({ messages, removeToast }: ToastProps) {
    return (
        <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-3 pointer-events-none">
            {messages.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    const icons = {
        success: <CheckCircle size={18} className="text-emerald-400" />,
        error: <AlertCircle size={18} className="text-red-400" />,
        info: <Info size={18} className="text-blue-400" />,
    };

    const bgStyles = {
        success: 'bg-emerald-950/40 border-emerald-500/20 shadow-emerald-900/10',
        error: 'bg-red-950/40 border-red-500/20 shadow-red-900/10',
        info: 'bg-blue-950/40 border-blue-500/20 shadow-blue-900/10',
    };

    return (
        <div
            className={cn(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 transform animate-in slide-in-from-right-full fade-in",
                bgStyles[toast.type],
                isExiting && "opacity-0 translate-x-12 scale-95"
            )}
        >
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="text-sm font-medium text-white pr-2 leading-snug">{toast.message}</p>
            <button
                onClick={handleClose}
                className="shrink-0 text-slate-400 hover:text-white transition-colors p-1"
            >
                <X size={16} />
            </button>
        </div>
    );
}
