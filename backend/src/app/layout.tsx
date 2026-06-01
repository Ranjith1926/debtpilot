export const metadata = {
  title: 'DebtPilot API',
  description: 'DebtPilot Backend API Server',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
