import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} admin-override h-screen overflow-y-auto bg-neutral-950 text-neutral-200 antialiased`}>
      <style dangerouslySetInnerHTML={{__html: `
        .admin-override {
          text-transform: none !important;
          font-family: ${inter.style.fontFamily}, ui-sans-serif, system-ui, sans-serif !important;
        }
        .admin-override * {
          text-transform: none;
        }
      `}} />
      {children}
    </div>
  );
}
