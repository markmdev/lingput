import { Section } from "@/components/Section";
import { Users, BookHeart, Goal } from "lucide-react";

const useCases = [
  {
    icon: <Users className="w-8 h-8 text-indigo-600" />,
    title: "For the motivated self-learner",
    description:
      "Tired of flashcards? Acquire vocabulary naturally with content you find interesting.",
  },
  {
    icon: <BookHeart className="w-8 h-8 text-indigo-600" />,
    title: "For the avid reader",
    description:
      "Enjoy reading short stories in your target language that are tailored to your vocabulary level.",
  },
  {
    icon: <Goal className="w-8 h-8 text-indigo-600" />,
    title: "For the consistent learner",
    description:
      "Track, review, and master new words over time with our smart vocabulary tracking system.",
  },
];

export default function UseCases() {
  return (
    <Section>
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Who is it for?</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-12">
          Lingput is designed for learners who prefer immersive and contextual learning over
          traditional methods.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {useCases.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-200/50 hover:shadow-lg transition-shadow text-center"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
