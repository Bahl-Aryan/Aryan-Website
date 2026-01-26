export interface ProjectItem {
  slug: string;
  title: string;
  subtitle: string;
  domain: string;
  metric?: string;
  problem: string;
  approach: string;
  implementation: string;
  results: string[];
  learnings: string;
  underTheHood: Array<{ title: string; content: string }>;
}

export const projectItems: ProjectItem[] = [
  {
    slug: "torchinductor-dynamic-shapes",
    title: "TorchInductor Dynamic Shapes",
    subtitle: "Optimizing PyTorch compilation for dynamic tensor shapes, reducing compilation overhead by 87.5%.",
    domain: "Compilers",
    metric: "-87.5% compilations, 90x cold start",
    problem: "PyTorch's TorchInductor compiler recompiles kernels for every unique tensor shape combination, leading to excessive compilation overhead. This is particularly problematic for models with dynamic input shapes, where compilation time can exceed execution time.",
    approach: "Implemented shape caching and kernel reuse strategies. Analyzed compilation patterns to identify opportunities for shape generalization. Built a profiling system to track compilation frequency and identify hot paths.",
    implementation: "Created a shape cache that maps tensor shape signatures to compiled kernels. Implemented shape generalization logic that can reuse kernels for compatible shapes (e.g., different batch sizes with same feature dimensions). Added lazy compilation that defers kernel generation until first use, with background pre-compilation for predicted shapes. Integrated with PyTorch's compilation pipeline to intercept shape-specific compilation requests.",
    results: [
      "87.5% reduction in total compilations",
      "90x improvement in cold start time",
      "Maintained 100% numerical correctness",
    ],
    learnings: "Compiler optimizations require deep understanding of both the compilation pipeline and runtime behavior. Profiling is essential—many optimization opportunities only become visible with real-world workloads. The tradeoff between compilation time and execution time is nuanced; sometimes more compilation upfront leads to better overall performance.",
    underTheHood: [
      {
        title: "Shape Caching",
        content: "Hash-based shape signature generation. LRU cache with configurable size limits. Shape compatibility checking using dimension matching rules.",
      },
      {
        title: "Compilation Pipeline",
        content: "Intercepted TorchInductor compilation calls. Shape generalization algorithm that identifies reusable kernels. Background compilation thread pool for predicted shapes.",
      },
      {
        title: "Performance",
        content: "Zero overhead for cache hits. Minimal memory overhead with bounded cache size. Thread-safe implementation for concurrent model execution.",
      },
    ],
  },
  {
    slug: "financial-rag-chatbot",
    title: "Financial RAG Chatbot",
    subtitle: "Retrieval-augmented generation system for financial document analysis with sub-second response times.",
    domain: "RAG",
    metric: "<1s response time",
    problem: "Financial analysts need to quickly query large document collections (SEC filings, earnings reports, research papers). Traditional search returns too many results, while LLMs lack domain-specific knowledge and can hallucinate.",
    approach: "Built a RAG (Retrieval-Augmented Generation) system that combines semantic search with LLM generation. Used vector embeddings for document retrieval and implemented caching to reduce latency. Designed the system for scalability to handle growing document collections.",
    implementation: "Pinecone vector database for semantic search with financial document embeddings. OpenAI GPT-4 for generation with carefully crafted prompts that include retrieved context. Redis caching layer for frequent queries. Responsive animated UI built with React and Framer Motion. Implemented query expansion and reranking to improve retrieval quality.",
    results: [
      "Sub-second response times for cached queries",
      "95%+ accuracy on factual queries",
      "Scalable to 100k+ documents",
    ],
    learnings: "RAG systems require careful tuning of retrieval parameters—too few documents miss context, too many add noise. Caching is critical for user experience; most queries are variations of common questions. The UI/UX matters as much as the backend; users need to understand what sources were used and why certain answers were generated.",
    underTheHood: [
      {
        title: "Vector Search",
        content: "Pinecone index with 1536-dimensional embeddings (OpenAI text-embedding-ada-002). Hybrid search combining semantic similarity with keyword matching. Query expansion using financial domain synonyms.",
      },
      {
        title: "Caching Strategy",
        content: "Redis for query result caching with 1-hour TTL. Cache key generation from normalized query text. Cache warming for common queries during off-peak hours.",
      },
      {
        title: "UI Architecture",
        content: "React with TypeScript. Framer Motion for smooth animations. Real-time streaming of LLM responses. Source attribution display with document links.",
      },
    ],
  },
];

export function getProjectItem(slug: string): ProjectItem | undefined {
  return projectItems.find((item) => item.slug === slug);
}
