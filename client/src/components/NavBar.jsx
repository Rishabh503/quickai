import React, { useEffect, useState } from "react";
// import  assets from './assets/assets.js'
// import
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { assets } from "../assets/assets";
import { useAuth, useClerk, UserButton, useUser } from "@clerk/clerk-react";
// import logi.png from "../assets"
// import logo from "../../public"
import axios from "axios"
import toast from "react-hot-toast";
axios.defaults.baseUrl = import.meta.env.VITE_BASE_URL;
const Navbar = () => {
   const { getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState(0)
  const [plan, setPlan] = useState("")

  const { user } = useClerk();
  console.log(user)
  const { openSignIn } = useClerk();

  const getUserCredits=async()=>{
    try {
      setLoading(true);
      const { data } = await axios.get("/api/user/get-user-plan", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        console.log("did data come ?", data);
        setCredits(data.credits)
        setPlan(data.plan)
      }
    } catch (error) {
      console.log(error, "this is the error");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{
    getUserCredits()
  },[user])

  return (
    <div className="fixed z-5 w-full bg-[#171212] text-white backdrop-blur-2xl flex justify-between items-center py-3 px- sm:px-10 xl:px-5">
      <img
        src="../../logi.png"
        alt="logo"
        className="w-32 h-16 sm:w-44 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {user ? (
      <div className="flex items-center justify-between gap-4 ">
          <NavLink to={'/ai/community'}>
        Community
       </NavLink>
          <NavLink to={'/ai/write-article'}>
        Tools
       </NavLink>
          <NavLink to={'/ai'}>
        Creations
       </NavLink>
       <p>

       { plan==="free"?
       <p>
         {credits} 🔥
       </p>
       :""}
       </p>
        <UserButton />
      </div>
      ) : (

       <>
       
       
        <button onClick={openSignIn}   className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5">
          Get started <ArrowRight className="w-4 h-4" />
        </button>
       </>
      )}
    </div>
  );
};

export default Navbar;
