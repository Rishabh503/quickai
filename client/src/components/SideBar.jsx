import { Protect, useClerk, useUser } from "@clerk/clerk-react";
import {
  Eraser,
  FileText,
  Hash,
  House,
  Image,
  LogOut,
  Scissors,
  SquarePen,
  Users,
} from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <div
      className={`w-60 bg-[#171212] text-white border-r border-[#1a1a1a] flex 
        flex-col justify-between items-center max-sm:absolute top-14 
        bottom-0 z-40 ${
          sidebar ? "translate-x-0" : "max-sm:-translate-x-full"
        } transition-all duration-300 
        ease-in-out`}
    >
      <div className="my-7 w-full px-3">
        <h1 className="mt-2 mb-6 text-sm font-semibold text-gray-400 px-3">
          TOOLS
        </h1>
        <div className="space-y-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `px-4 py-3 flex items-center gap-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#2a2424] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      
      <div className="w-full border-t border-[#1a1a1a] p-4 px-5 flex items-center justify-between">
        <div
          onClick={openUserProfile}
          className="flex gap-3 items-center cursor-pointer hover:opacity-80 transition"
        >
          <img src={user?.imageUrl} className="w-9 h-9 rounded-full" alt="" />
          <div>
            <h1 className="font-medium text-sm">{user?.fullName}</h1>
            <p className="text-xs text-gray-400">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </p>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className="w-5 h-5 text-gray-400 hover:text-white transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Sidebar;