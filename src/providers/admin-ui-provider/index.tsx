"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type AdminUIContextType = {
    isSidebarCollapsed: boolean;
    isMobileSidebarOpen: boolean;
    openSidebar: () => void;
    closeSidebar: () => void;
    closeMobileSidebar: () => void;
};

const AdminUIContext =
    createContext<AdminUIContextType | null>(null);

export function AdminUIProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] =
        useState(false);

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
        useState(false);

    const openSidebar = useCallback(() => {
        setIsSidebarCollapsed(false);
        setIsMobileSidebarOpen(true);
    }, []);

    const closeSidebar = useCallback(() => {
        setIsSidebarCollapsed(true);
        setIsMobileSidebarOpen(false);
    }, []);

    const closeMobileSidebar = useCallback(() => {
        setIsMobileSidebarOpen(false);
    }, []);

    const value = useMemo(
        () => ({
            isSidebarCollapsed,
            isMobileSidebarOpen,
            openSidebar,
            closeSidebar,
            closeMobileSidebar,
        }),
        [
            isSidebarCollapsed,
            isMobileSidebarOpen,
            openSidebar,
            closeSidebar,
            closeMobileSidebar,
        ],
    );

    return (
        <AdminUIContext.Provider value={value}>
            {children}
        </AdminUIContext.Provider>
    );
}

export function useAdminUI() {
    const context = useContext(AdminUIContext);

    if (!context) {
        throw new Error(
            "useAdminUI must be used within AdminUIProvider",
        );
    }

    return context;
}