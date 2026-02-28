import React from "react";
import { PricingTable } from "@clerk/clerk-react";

const Plan = () => {
  return (
    <section className="relative py-32 px-6 sm:px-10 xl:px-32 bg-white overflow-hidden">
      {/* Subtle background patterns */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      
      <div className="relative z-10 text-center mb-16">
        <h2 className="text-4xl sm:text-6xl font-black text-neutral-900 mb-6 tracking-tight">
          Simple, <span className="text-red-500">Transparent</span> Pricing
        </h2>
        <p className="text-neutral-500 text-lg sm:text-xl max-w-2xl mx-auto font-medium">
          Choose the perfect plan for your creative journey. Start for free 
          and scale as you grow with our flexible options.
        </p>
      </div>

      <div className="relative z-10 mt-12 flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-neutral-100 to-white shadow-2xl border border-neutral-200/50">
            <PricingTable className="rounded-[2.25rem] overflow-hidden" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plan;
