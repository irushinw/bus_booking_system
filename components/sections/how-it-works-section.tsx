"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Search, Calendar, CreditCard, MapPin } from "lucide-react";

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Search Routes",
      description: "Enter your destination and travel date to find available buses",
      step: "01"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Select Bus",
      description: "Choose from various bus types and timings that suit your schedule",
      step: "02"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Book & Pay",
      description: "Secure payment with multiple options and instant confirmation",
      step: "03"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Track & Travel",
      description: "Get real-time updates and enjoy your comfortable journey",
      step: "04"
    },
  ];

  return (
    <section ref={ref} className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Booking your bus ticket is simple and straightforward. Follow these easy steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative"
            >
              <div className="bg-foreground/90 border border-ring rounded-xl p-6 h-full hover:border-yellow-400/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-yellow-400">
                    {step.icon}
                  </div>
                  <div className="text-yellow-400 font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {step.description}
                </p>
              </div>
              
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}