'use client';

import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    confirmLabel?: string;
    onConfirm?: () => void;
    type?: 'danger' | 'success' | 'info';
    loading?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    confirmLabel = 'Confirm',
    onConfirm,
    type = 'info',
    loading = false,
}: ModalProps) {
    if (!isOpen) return null;

    const typeStyles = {
        danger: 'bg-red-500/10 text-red-400 border-red-500/20',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };

    const buttonStyles = {
        danger: 'bg-red-600 hover:bg-red-500 shadow-red-900/20',
        success: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20',
        info: 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20',
    };

    const Icon = type === 'danger' ? AlertTriangle : type === 'success' ? CheckCircle : Info;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ease-out animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-300 ease-out animate-in zoom-in-95 fade-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg border", typeStyles[type])}>
                            <Icon size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 text-slate-300 text-sm leading-relaxed">
                    {children}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-950/30 flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-slate-800/50">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800"
                    >
                        Cancel
                    </button>
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={cn(
                                "w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50",
                                buttonStyles[type]
                            )}
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {confirmLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
