"use client";
import { Section } from "@/components/Section";
import { motion } from "framer-motion";
import { BookCheck, Brain, Repeat } from "lucide-react";

const evidence = [
  {
    icon: <BookCheck className="w-8 h-8 text-indigo-500" />,
    title: "Stephen Krashen's Hypothesis",
    description:
      "Based on the theory of 'Comprehensible Input,' which states we acquire language when we understand messages in a low-anxiety environment.",
  },
  {
    icon: <Brain className="w-8 h-8 text-green-500" />,
    title: "Contextual Learning",
    description:
      "Learning words in a story is more effective than isolated flashcards. The narrative provides rich context that helps with retention.",
  },
  {
    icon: <Repeat className="w-8 h-8 text-purple-500" />,
    title: "Repetition, Not Rote",
    description:
      "Our AI intelligently re-introduces new words over time, providing natural spaced repetition without tedious drills.",
  },
];

export default function MethodProof() {
  return (
    <Section id="method" className="relative bg-background py-24 sm:py-32">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1200px] bg-gradient-to-br from-indigo-100 via-white to-purple-100 transform -skew-y-6 -translate-y-1/3"></div>
      </div>
      <div className="relative">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">A Smarter Way to Learn</h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-700 mb-12">
            Lingput is built on proven principles of language acquisition. We focus on making
            learning feel natural, not like a chore.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {evidence.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-200/50 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  {item.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
