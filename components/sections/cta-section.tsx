"use client";

import { motion } from "framer-motion";
import { Download, Smartphone } from "lucide-react";
import { useRouter } from 'next/navigation'

export default function CTASection() {
  const router = useRouter()

  return (
    <section className="py-16 bg-gradient-to-r from-chart-1/60 to-black">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6"
          >
            <Smartphone className="w-8 h-8 text-black" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Download Our App
          </h2>
          <p className="text-white text-lg mb-8">
            Get the full experience with our mobile app. Book tickets, track buses, 
            and manage your bookings on the go.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/signup')}
              className="bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Install PWA
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/#learn-more')}
              className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-yellow-400 hover:text-black transition-all duration-300"
            >
              Learn More
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-8 text-sm text-white"
          >
            <p>Available as Progressive Web App (PWA)</p>
            <p>Works on iOS, Android, and Desktop</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}