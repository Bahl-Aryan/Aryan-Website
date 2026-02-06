export interface LeadershipItem {
  title: string
  role: string
  timeframe: string
  description: string
  achievements: string[]
  scale: string
}

export const leadershipItems: LeadershipItem[] = [
  {
    title: "HackIllinois",
    role: "Organizer",
    timeframe: "2023 - 2024",
    description:
      "Led operations and systems development for one of the largest student-run hackathons in the Midwest, managing infrastructure that scales to support thousands of participants.",
    achievements: [
      "Raised $50k+ in sponsorship funding",
      "Managed sponsor operations and partnerships",
      "Coordinated event logistics for 1000+ attendees",
    ],
    scale: "1000+ attendees, $50k+ funding",
  },
  {
    title: "Systems Development Chair",
    role: "Technical Lead",
    timeframe: "2023 - 2024",
    description:
      "Led a team of developers building and maintaining critical infrastructure, focusing on systems that stay fast as they scale. Oversaw database migrations, dev tooling, and infrastructure improvements.",
    achievements: [
      "Led team of 8 developers",
      "Executed zero-downtime database migration",
      "Built developer tooling reducing deployment time by 40%",
      "Designed scalable architecture for growing user base",
    ],
    scale: "8-person team, 40% deployment time reduction",
  },
]
