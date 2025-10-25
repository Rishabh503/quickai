import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import { useUser, SignIn } from "@clerk/clerk-react";
import Navbar from "../components/NavBar";

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const { user } = useUser();
  
  return user ? (
    <div className="flex flex-col items-start justify-start h-screen bg-[#171212]">
      <div className="w-full fixed top-0 z-50">
        <Navbar setSidebar={setSidebar} sidebar={sidebar} />
      </div>
      
      <div className="flex-1 w-full flex h-screen pt-14">
        <SideBar sidebar={sidebar} setSidebar={setSidebar} />
        <div className="flex-1 overflow-auto bg-[#171212]">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <SignIn />
    </div>
  );
};

export default Layout;