import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Providers from './providers';
import BootstrapClient from '@/components/BootstrapClient';

export const metadata = {
  title: 'حِرفة أصلية | Hirfeh Asliyeh',
  description: 'منصة الحرف الأردنية الأصيلة — اكتشف، تواصل، اقتنِ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <BootstrapClient />
          {children}
        </Providers>
      </body>
    </html>
  );
}
