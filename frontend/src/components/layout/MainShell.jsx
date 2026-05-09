import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function MainShell({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
