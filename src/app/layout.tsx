import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Photofolio — A better way to share your work",
  description: "Private, branded galleries for photographers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
