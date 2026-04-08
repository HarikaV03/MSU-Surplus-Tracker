// components/Layout.js
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 font-bold">
        MSU Surplus Tracker
      </header>

      <main className="flex-1 p-6 bg-gray-100">{children}</main>

      <footer className="bg-gray-200 text-center p-4">
        &copy; 2026 MSU Surplus Tracker
      </footer>
    </div>
  )
}
