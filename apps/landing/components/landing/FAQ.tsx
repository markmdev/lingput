import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/Section";

const faqs = [
  {
    question: "How does Lingput work?",
    answer:
      "Lingput uses AI to generate short stories based on your vocabulary. You first take a quick vocabulary assessment, and then the app creates stories with words you know and a few new ones. This helps you learn new vocabulary in context, which is a very effective way to learn a language.",
  },
  {
    question: "What languages are supported?",
    answer:
      "Currently, Lingput supports learning German for English speakers. We are planning to add more languages in the future, such as Spanish, French, and others.",
  },
  {
    question: "Is it really free?",
    answer:
      "Yes, Lingput has a free plan that allows you to generate up to 5 stories per day. This is a great way to get started and see if the app is a good fit for you. We plan to introduce a Pro plan with more features in the future.",
  },
  {
    question: "How is my vocabulary assessed?",
    answer:
      "The vocabulary assessment is a quick test where you are shown a series of words from a frequency list. You simply mark the words you know. This gives us a good estimate of your vocabulary size to start generating personalized stories.",
  },
];

export default function FAQ() {
  return (
    <Section id="faq">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-12">
          Here are some common questions about Lingput.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg font-semibold text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
