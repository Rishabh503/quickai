import React, { useEffect, useState } from "react";
// import  assets from './assets/assets.js'
// import
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { assets } from "../assets/assets";
import { useAuth, useClerk, UserButton, useUser } from "@clerk/clerk-react";
// import logi.png from "../assets"
// import logo from "../../public"
import axios from "axios";
import toast from "react-hot-toast";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
const Navbar = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState("");

  const { user } = useClerk();
  console.log(user);
  const { openSignIn } = useClerk();

  const getUserCredits = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/user/get-user-plan", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        console.log("did data come ?", data);
        setCredits(data.credits);
        setPlan(data.plan);
      }
    } catch (error) {
      console.log(error, "this is the error");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getUserCredits();
  }, [user]);

  return (
    <div className="fixed z-50 w-full bg-[#171212] text-white backdrop-blur-2xl flex justify-between items-center py-3 px-6 sm:px-10 xl:px-5">
      <img
        src="/logi.png"
        alt="logo"
        className="w-32 h-16 sm:w-44 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {user ? (
        <div className="flex items-center gap-8 font-medium">
          <NavLink
            to={"/ai/community"}
            className={({ isActive }) =>
              `hover:text-red-500 transition-colors duration-300 ${
                isActive ? "text-red-500" : "text-neutral-300"
              }`
            }
          >
            Community
          </NavLink>
          <NavLink
            to={"/ai/write-article"}
            className={({ isActive }) =>
              `hover:text-red-500 transition-colors duration-300 ${
                isActive ? "text-red-500" : "text-neutral-300"
              }`
            }
          >
            Tools
          </NavLink>
          <NavLink
            to={"/ai"}
            className={({ isActive }) =>
              `hover:text-red-500 transition-colors duration-300 ${
                isActive ? "text-red-500 font-bold" : "text-neutral-300"
              }`
            }
          >
            Creations
          </NavLink>
          {plan === "free" && (
            <div className="px-4 py-1.5 bg-neutral-800 border border-white/10 rounded-full flex items-center gap-2 text-sm font-bold">
              <span className="text-neutral-400 font-medium">Credits</span>
              <span className="text-red-500">{credits}</span>
              <span>🔥</span>
            </div>
          )}
          <UserButton />
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <button
            onClick={openSignIn}
            className="group flex items-center gap-2 rounded-2xl text-base font-bold cursor-pointer bg-red-600 text-white px-8 py-2.5 hover:bg-white hover:text-red-600 transition-all duration-300 whitespace-nowrap"
          >
            Get started
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
