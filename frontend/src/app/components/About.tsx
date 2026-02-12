import { Sparkles, ThumbsUp, Users } from "lucide-react";

export function About() {
  const features = [
    {
      icon: Sparkles,
      title: "Personalized Discovery",
      description:
        "Find trips tailored to your interests, budget, and travel style with our smart matching algorithm",
    },
    {
      icon: ThumbsUp,
      title: "Smart Recommendations",
      description:
        "Get curated suggestions based on your preferences and reviews from trusted travelers",
    },
    {
      icon: Users,
      title: "Travelers & Organizers",
      description:
        "Connect with experienced trip organizers and join a community of like-minded travelers",
    },
  ];

  return (
    <section id="about" className="py-24 px-6 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            About Trip Mate
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A social platform where travelers discover, book, and share amazing
            experiences curated by passionate organizers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-teal-50 dark:bg-teal-950 mb-4">
                  <Icon className="size-6 text-teal-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
