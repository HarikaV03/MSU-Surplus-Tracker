import "./globals.css";

export const metadata = {
  title: "MSU Surplus Tracker",
  description: "Inventory Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body className="bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
