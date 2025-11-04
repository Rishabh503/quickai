import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { BentoDemo } from "./BentoDemo";

export const AITools = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <section className="relative py-24 px-6 sm:px-16 xl:px-32 bg-gradient-to-b from-black via-neutral-950 to-black text-white">
      {/* Red subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.15),transparent_60%)] pointer-events-none" />

      {/* Heading */}
      <div className="relative text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold text-red-500 mb-4">
          Explore Our AI Tools
        </h2>
        <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
          Unlock your creative potential with our intelligent AI-powered tools — from image generation to smart resume reviews.
        </p>
      </div>

      {/* Bento section */}
      <div className="relative z-10">
        <BentoDemo />
      </div>
    </section>
  );
};
