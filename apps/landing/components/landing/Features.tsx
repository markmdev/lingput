"use client";
import { Section } from "@/components/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Headphones, BarChart, BrainCircuit, Mic, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Sparkles className="w-8 h-8 text-indigo-600" />,
    title: "Personalized Story Generation",
    description:
      "AI crafts stories using words you know, plus a few new ones to expand your vocabulary naturally.",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
    title: "Chunked Translations",
    description:
      "Stories are broken down into smaller, manageable chunks with translations to aid comprehension.",
  },
  {
    icon: <Headphones className="w-8 h-8 text-indigo-600" />,
    title: "Audio Generation",
    description:
      "Listen to the full story with translations, helping you to improve your listening and pronunciation skills.",
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-indigo-600" />,
    title: "Smart Word Tracking",
    description:
      "Track your progress by marking words as 'learning' or 'learned'. The app adapts to your knowledge.",
  },
  {
    icon: <BarChart className="w-8 h-8 text-indigo-600" />,
    title: "Vocabulary Assessment",
    description:
      "A quick test to estimate your vocabulary size, allowing for perfectly tailored stories from the start.",
  },
  {
    icon: <Mic className="w-8 h-8 text-indigo-600" />,
    title: "Interactive Onboarding",
    description: "Get familiar with all the features through a guided tour on your first visit.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export default function Features() {
  return (
    <Section id="features" className="bg-background">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Learn</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-700 mb-12">
          Lingput provides a complete toolkit for language acquisition through comprehensible input.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Card className="h-full bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-gray-200/50 hover:shadow-primary/10 transition-shadow duration-300 group">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
