// Layout.jsx

import { Sidebar } from "@components/shared/Sidebar";
import { Header } from "@components/shared/Header";
import { Outlet } from "react-router-dom";

 const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex flex-col flex-1">
        <Header />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Outlet />
      </main>
          </div>
    </div>
  );
};
export default Layout;