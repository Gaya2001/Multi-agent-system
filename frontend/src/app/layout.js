import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Medical Triage MAS — AI-Powered Patient Triage",
  description:
    "A multi-agent system that automates medical triage using LangGraph + Ollama. Submit patient symptoms and receive instant urgency classification, severity scoring, and condition matching.",
  keywords: [
    "medical triage",
    "AI",
    "multi-agent system",
    "patient safety",
    "emergency medicine",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-grid">{children}</body>
    </html>
  );
}
