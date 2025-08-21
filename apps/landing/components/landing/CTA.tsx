"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Section } from "@/components/Section";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-primary to-purple-600 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/path-to-your-pattern.svg')] opacity-10"
      ></div>
      <div className="relative text-center text-white">
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          Ready to Start Learning?
        </motion.h2>
        <motion.p
          className="max-w-2xl mx-auto text-lg text-indigo-100 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Join Lingput today and experience a new way of learning languages. It&apos;s free to get
          started.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            size="lg"
            asChild
            className="bg-white text-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-white/90"
          >
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/signup`}>Create Your Free Account</Link>
          </Button>
        </motion.div>
      </div>
    </Section>
  );
}
