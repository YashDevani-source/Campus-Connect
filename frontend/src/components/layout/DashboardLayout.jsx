import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
