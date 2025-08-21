"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/Section";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    priceDescription: "Forever",
    description: "Get started with the core features of Lingput.",
    features: [
      "5 AI-generated stories per day",
      "Vocabulary assessment",
      "Smart word tracking",
      "Audio for all stories",
    ],
    cta: "Sign up for free",
    ctaLink: `${process.env.NEXT_PUBLIC_APP_URL}/signup`,
    recommended: true,
  },
  {
    name: "Pro",
    price: "Soon",
    priceDescription: "",
    description: "Unlock the full potential of Lingput.",
    features: [
      "Unlimited story generations",
      "Advanced statistics",
      "Import from Anki",
      "Access to all future languages",
      "Priority support",
    ],
    cta: "Coming soon",
    ctaLink: "#",
    isComingSoon: true,
    recommended: false,
  },
];

export default function Pricing() {
  return (
    <Section id="pricing" className="relative bg-background py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-100/50 via-white to-purple-100/50"></div>
      </div>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-700 mb-12">
          Start for free, and upgrade when you&apos;re ready to take your learning to the next
          level.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              className={`h-full flex flex-col rounded-2xl shadow-lg transition-all duration-300 ${
                plan.recommended
                  ? "border-2 border-primary shadow-primary/20"
                  : "border-gray-200/50"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">
                    {plan.priceDescription && ` / ${plan.priceDescription}`}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className={`w-full ${plan.recommended && "animate-pulse"}`}
                  variant={plan.recommended ? "default" : "secondary"}
                  disabled={plan.isComingSoon}
                >
                  <Link href={plan.ctaLink}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
