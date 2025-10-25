import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, X } from "lucide-react";
import SideBar from "../components/SideBar";
import { useUser ,SignIn} from "@clerk/clerk-react";
import Navbar from "../components/NavBar";

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const {user}=useUser()
  return user? (
    <div className="flex bg-[#171212] text-white flex-col items-start justify-start h-screen">
      {/* <nav>
        <img src={assets.logo} alt="" onClick={() => navigate("/")} />
        {sidebar ? (
          <X
            onClick={() => setSidebar(false)}
            className="w-6 h-6 text-gray-600 sm:hidden"
          />
        ) : (
          <Menu
            onClick={() => setSidebar(true)}
            className="w-6 h-6 text-gray-600 sm:hidden"
          />
        )}
      </nav> */}
     <div className="">
       <Navbar/>
     </div>
      <div className="flex-1 w-full flex h-[calc(100vh-64px)]">
        <SideBar sidebar={sidebar} setSidebar={setSidebar} />
        <div className="flex-1 mt-14 bg-[#]">
          <Outlet />
        </div>
      </div>
    </div>
  ):(
    <div className="flex items-center justify-center h-screen">
      <SignIn/>
    </div>
  )
};

export default Layout;
