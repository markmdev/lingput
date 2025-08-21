"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Section } from "@/components/Section";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <Section className="pt-32 pb-20 text-center relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-1/2 bg-background/80 rounded-t-full"></div>
      </div>

      <div className="relative z-10">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 pb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Learn German with AI-Generated Stories
        </motion.h1>
        <motion.p
          className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Stop memorizing boring vocabulary lists. Start acquiring German naturally with stories
          tailored for English speakers.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/signup`}>Start Learning for Free</Link>
          </Button>
        </motion.div>
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "backOut" }}
        >
          <div className="w-full max-w-5xl mx-auto px-4">
            <div className="relative rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <Image
                src="/demo-story.png"
                alt="Lingput app screenshot showing an AI-generated story"
                width={1200}
                height={750}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
