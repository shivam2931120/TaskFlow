// Root Layout - poori app ka main layout
// yeh file saare pages ko wrap karti hai

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Metadata - SEO ke liye
export const metadata = {
  title: 'TaskFlow',
  description: 'A modern SaaS task management dashboard with analytics and smart suggestions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Load Google Material Symbols font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased">
        {/* Auth context poori app ko wrap karega */}
        <AuthProvider>
          {children}
          {/* Toast notifications - can be triggered from any page */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#102219',
                color: '#f1f5f9',
                border: '1px solid rgba(17, 212, 115, 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#11d473',
                  secondary: '#102219',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#102219',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
