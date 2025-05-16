import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <Sidebar />
      <div className="flex flex-col flex-grow ml-64">
        <Header />
        <main className="pt-16 p-6 overflow-y-auto flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
