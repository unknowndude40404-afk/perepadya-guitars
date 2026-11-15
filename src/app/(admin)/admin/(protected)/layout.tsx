import { requireAdminPage } from "@/shared/lib/auth";

import { AdminUIProvider } from "@/providers/admin-ui-provider";
import { AdminSidebar } from "@/widgets/admin-sidebar";
import { AdminHeader } from "@/widgets/admin-header";

export default async function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdminPage();

    return (
        <AdminUIProvider>
            <div className="flex min-h-screen w-full">
                <AdminSidebar />

                <div className="flex min-w-0 flex-1 flex-col">
                    <AdminHeader />

                    <main className="flex-1 bg-[var(--page-bg)] p-6">
                        {children}
                    </main>
                </div>
            </div>
        </AdminUIProvider>
    );
}