import React from "react";
import { PricingTable } from "@clerk/clerk-react";

const Plan = () => {
  return (
    <section className="max-w-5xl mx-auto py-20 px-6 relative z-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold text-red-500 mb-4">
          Pick Your Perfect Plan
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Start free and upgrade anytime. Whether you're experimenting or building
          full-scale AI tools, there’s a plan that fits your journey.
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <div className="w-full max-w-4xl">
          <PricingTable className="rounded-2xl shadow-lg bg-white/60 backdrop-blur-md border border-gray-200" />
        </div>
      </div>
    </section>
  );
};

export default Plan;
