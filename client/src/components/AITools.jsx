import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { BentoDemo } from "./BentoDemo";

export const AITools = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <section className="relative py-32 px-6 sm:px-10 xl:px-32 bg-neutral-950 text-white overflow-hidden">
      {/* Immersive effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

      {/* Heading */}
      <div className="relative z-10 text-center mb-20">
        <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">
          Supercharge <span className="text-red-500">Creativity</span> with AI
        </h2>
        <p className="text-neutral-400 max-w-2xl mx-auto text-lg sm:text-xl font-medium leading-relaxed">
          From brainstorming blog titles to generating high-end visuals, our 
          intelligent tools are built to elevate your creative workflow.
        </p>
      </div>

      {/* Bento section */}
      <div className="relative z-10">
        <BentoDemo />
      </div>
    </section>
  );
};
