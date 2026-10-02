import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "MotoTrack - Smart Vehicle Maintenance Tracker",
  description: "IoT Odometer Tracker & Smart Service Reminder untuk Motor Anda",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} h-full`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface antialiased" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
