import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <TopNav />
      <Sidebar />
      <main className="md:pl-64 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
