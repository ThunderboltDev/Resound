"use client";

import { motion } from "framer-motion";
import { MessageCircle, Sparkle } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="w-full h-screen grid place-items-center">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="size-fit absolute z-1 inset-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Sparkle className="fill-primary stroke-primary size-8" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <MessageCircle className="size-16 stroke-1 stroke-black fill-white" />
        </motion.div>
      </div>
    </div>
  );
}
