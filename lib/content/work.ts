export interface WorkItem {
  slug: string
  title: string
  subtitle: string
  role: string
  timeframe: string
  stack: string[]
  metric: string
  context: string
  constraints: string
  decisions: string
  results: string[]
  reflection: string
  underTheHood: Array<{ title: string; content: string }>
}

export const workItems: WorkItem[] = [
  {
    slug: "nora-music",
    title: "Nora Music",
    subtitle:
      "AWS migration engineered for growth, reducing latency while scaling to handle 400% more engagement.",
    role: "Lead Engineer",
    timeframe: "2023 - 2024",
    stack: ["AWS Lambda", "ECS", "Aurora", "ElastiCache"],
    metric: "+400% session duration",
    context:
      "Nora Music required a complete infrastructure overhaul to support rapid user growth and improve performance. The existing monolithic architecture couldn't scale efficiently, leading to high latency and reliability issues during peak traffic.",
    constraints:
      "Zero-downtime migration, budget constraints, and maintaining backward compatibility with existing APIs. The system needed to handle 10x traffic spikes without degradation.",
    decisions:
      "Chose serverless-first architecture with Lambda for compute, ECS for containerized services, and Aurora Serverless for database scaling. Implemented ElastiCache for session management and frequently accessed data. Designed for horizontal scaling with auto-scaling groups that respond to latency metrics, ensuring systems stay fast as they scale.",
    results: [
      "+400% increase in average session duration",
      "-60% reduction in p95 load time",
      "99.9% uptime during migration period",
    ],
    reflection:
      "This migration reinforced the importance of designing for scale from day one. The serverless architecture not only improved performance but also reduced operational overhead, allowing the team to focus on product features rather than infrastructure management.",
    underTheHood: [
      {
        title: "Architecture",
        content:
          "Microservices architecture with API Gateway routing to Lambda functions. ECS services handle long-running processes. Aurora Serverless v2 provides automatic scaling based on workload.",
      },
      {
        title: "Caching Strategy",
        content:
          "Multi-layer caching: ElastiCache Redis for session data and frequently accessed content, CloudFront for static assets. Cache invalidation strategy ensures data consistency while maximizing hit rates.",
      },
      {
        title: "Tradeoffs",
        content:
          "Serverless cold starts were mitigated with provisioned concurrency for critical paths. Cost optimization through reserved capacity for predictable workloads, with on-demand scaling for traffic spikes.",
      },
    ],
  },
  {
    slug: "boston-bioprocess",
    title: "Boston Bioprocess",
    subtitle:
      "ML dashboard that reduces workload by 50% through intelligent automation and LLM-assisted UI tooling.",
    role: "Full-Stack Engineer",
    timeframe: "2024",
    stack: ["React", "TypeScript", "FastAPI", "AWS Secrets Manager"],
    metric: "50% workload reduction",
    context:
      "Boston Bioprocess needed a modern dashboard to visualize ML model predictions and streamline bioprocess monitoring. The existing system required manual data entry and lacked real-time insights.",
    constraints:
      "HIPAA compliance requirements, integration with legacy systems, and need for secure credential management. The UI needed to be intuitive for non-technical users while providing advanced features for data scientists.",
    decisions:
      "Built a React/TypeScript frontend with FastAPI backend for real-time data processing. Integrated AWS Secrets Manager for secure credential storage. Implemented LLM-assisted UI tooling to help users generate queries and understand complex data patterns. Designed the system with reliability and latency in mind, using connection pooling and optimized database queries.",
    results: [
      "50% reduction in manual workload",
      "Real-time data processing with <200ms latency",
      "Zero security incidents with Secrets Manager integration",
    ],
    reflection:
      "The LLM-assisted features proved crucial for user adoption. By making complex data accessible through natural language, we reduced training time and increased feature utilization. The focus on reliability ensured the dashboard became a trusted tool rather than a source of frustration.",
    underTheHood: [
      {
        title: "Frontend Architecture",
        content:
          "React with TypeScript for type safety. Component library built with shadcn/ui for consistency. State management with React Query for server state and Zustand for UI state.",
      },
      {
        title: "Backend & Security",
        content:
          "FastAPI with async endpoints for concurrent request handling. AWS Secrets Manager integration for secure credential rotation. JWT-based authentication with refresh tokens.",
      },
      {
        title: "LLM Integration",
        content:
          "OpenAI API for natural language query generation. Prompt engineering to ensure accurate translation of user intent to database queries. Caching layer to reduce API costs and improve response times.",
      },
    ],
  },
]

export function getWorkItem(slug: string): WorkItem | undefined {
  return workItems.find((item) => item.slug === slug)
}
