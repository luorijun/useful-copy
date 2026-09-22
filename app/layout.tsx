import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "临时寄存",
  description: "安全寄存文本与文件，最长 24 小时后自动销毁。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
