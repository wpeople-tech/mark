export const SKILL_CONTENT: Record<string, string> = {
  'next-js-app-router': '# Next.js App Router Skill\n\n## Key Patterns\n- Use Server Components by default\n- Co-locate loading.tsx and error.tsx\n- Use route groups for organization\n\n## Best Practices\n- Keep data fetching in Server Components\n- Use generateStaticParams for static pages',
  
  'react-component-patterns': '# React Component Patterns\n\n## Key Patterns\n- Favor composition over inheritance\n- Use compound components\n- Implement controlled/uncontrolled patterns\n\n## Best Practices\n- Keep components focused and reusable',
  
  'typescript-strict': '# TypeScript Strict Mode\n\n## Key Patterns\n- Enable strict: true in tsconfig\n- Use explicit return types\n- Leverage discriminated unions\n\n## Best Practices\n- Use type inference for locals\n- Define shared types centrally',
  
  'tailwind-design-system': '# Tailwind Design System\n\n## Key Patterns\n- Configure custom theme\n- Use CSS variables for tokens\n- Leverage arbitrary values\n\n## Best Practices\n- Extract common patterns\n- Follow mobile-first design',
  
  'state-management': '# State Management\n\n## Key Patterns\n- Lift state to common ancestors\n- Use Context for global UI state\n- Implement reducers for complex logic\n\n## Best Practices\n- Keep state as local as possible',
  
  'web-performance': '# Web Performance\n\n## Key Patterns\n- Implement lazy loading\n- Optimize images\n- Use code splitting\n\n## Best Practices\n- Monitor Core Web Vitals\n- Use performance budgets',
  
  'prisma-orm': '# Prisma ORM\n\n## Key Patterns\n- Define schema in prisma/schema.prisma\n- Use Prisma Client for type-safe access\n- Leverage relation queries\n\n## Best Practices\n- Use include and select wisely\n- Implement pagination',
  
  'supabase-integration': '# Supabase Integration\n\n## Key Patterns\n- Use Supabase client\n- Implement Row Level Security\n- Leverage real-time subscriptions\n\n## Best Practices\n- Use anon key on client\n- Test RLS policies',
  
  'postgres-patterns': '# PostgreSQL Patterns\n\n## Key Patterns\n- Use indexes strategically\n- Implement foreign keys\n- Leverage JSONB and full-text search\n\n## Best Practices\n- Use UUIDs for distributed keys\n- Implement connection pooling',
  
  'redis-caching': '# Redis Caching\n\n## Key Patterns\n- Cache frequently accessed data\n- Implement cache-aside pattern\n- Use sorted sets for rankings\n\n## Best Practices\n- Set reasonable TTLs\n- Monitor cache hit rates',
  
  'api-routes-nextjs': '# API Routes for Next.js\n\n## Key Patterns\n- Define handlers in app/api/\n- Use NextRequest/NextResponse\n- Handle CORS properly\n\n## Best Practices\n- Validate request bodies\n- Implement proper error handling',
  
  'zod-validation': '# Zod Validation\n\n## Key Patterns\n- Define schemas for external inputs\n- Use z.infer for types\n- Implement custom error messages\n\n## Best Practices\n- Parse at the edge\n- Use safeParse for errors',
  
  'authentication': '# Authentication\n\n## Key Patterns\n- Use session-based auth\n- Implement OAuth providers\n- Hash passwords properly\n\n## Best Practices\n- Use HTTPS\n- Implement rate limiting\n- Use HTTP-only cookies',
  
  'deployment-vercel': '# Vercel Deployment\n\n## Key Patterns\n- Configure vercel.json\n- Use Preview Deployments\n- Implement proper caching\n\n## Best Practices\n- Optimize cold starts\n- Monitor logs and analytics',
  
  'docker-containerization': '# Docker Containerization\n\n## Key Patterns\n- Use multi-stage builds\n- Implement health checks\n- Use .dockerignore\n\n## Best Practices\n- Use slim base images\n- Pin versions',
  
  'python-fastapi': '# Python FastAPI\n\n## Key Patterns\n- Define routes with decorators\n- Use Pydantic models\n- Implement dependency injection\n\n## Best Practices\n- Use BackgroundTasks\n- Version your API',
  
  'python-async': '# Python Async Programming\n\n## Key Patterns\n- Use asyncio\n- Implement async generators\n- Leverage aiohttp/httpx\n\n## Best Practices\n- Use asyncio.gather\n- Implement timeout handling',
  
  'django-patterns': '# Django Patterns\n\n## Key Patterns\n- Organize into reusable apps\n- Use Class-Based Views\n- Implement Django REST Framework\n\n## Best Practices\n- Keep views thin\n- Optimize queries',
  
  'rust-systems': '# Rust Systems Programming\n\n## Key Patterns\n- Leverage ownership/borrowing\n- Use Result and Option\n- Implement traits\n\n## Best Practices\n- Use iterators and closures\n- Write tests alongside code',
  
  'rust-wasm': '# Rust WebAssembly\n\n## Key Patterns\n- Use wasm-pack\n- Leverage wasm-bindgen\n- Use console_error_panic_hook\n\n## Best Practices\n- Minimize binary size\n- Profile with devtools',
  
  'golang-patterns': '# Go Patterns\n\n## Key Patterns\n- Use interfaces\n- Implement error handling\n- Leverage goroutines and channels\n\n## Best Practices\n- Use gofmt\n- Write table-driven tests',
  
  'cpp-systems': '# C++ Systems Programming\n\n## Key Patterns\n- Use RAII\n- Implement Rule of Five\n- Use smart pointers\n\n## Best Practices\n- Prefer standard library\n- Enable compiler warnings',
  
  'cpp-performance': '# C++ Performance\n\n## Key Patterns\n- Use move semantics\n- Leverage SIMD intrinsics\n- Implement cache-friendly structures\n\n## Best Practices\n- Profile before optimizing\n- Use Google Benchmark',
  
  'cmake-build': '# CMake Build System\n\n## Key Patterns\n- Use modern CMake targets\n- Implement FetchContent\n- Leverage CMake presets\n\n## Best Practices\n- Require CMake 3.16+\n- Export targets',
  
  'audio-processing': '# Audio Processing\n\n## Key Patterns\n- Use Web Audio API\n- Implement real-time analysis\n- Leverage AudioWorklet\n\n## Best Practices\n- Resume AudioContext on interaction\n- Implement gain staging',
  
  'speech-to-text': '# Speech-to-Text\n\n## Key Patterns\n- Use Web Speech API\n- Implement OpenAI Whisper\n- Leverage VAD\n\n## Best Practices\n- Pre-process for noise reduction\n- Implement language detection',
  
  'llm-integration': '# LLM Integration\n\n## Key Patterns\n- Use structured prompts\n- Implement streaming\n- Leverage function calling\n\n## Best Practices\n- Implement retry logic\n- Validate outputs',
  
  'anthropic-claude': '# Anthropic Claude\n\n## Key Patterns\n- Use Messages format\n- Implement tool use\n- Leverage long context\n\n## Best Practices\n- Cache responses\n- Use right model for task',
  
  'langchain-agents': '# LangChain Agents\n\n## Key Patterns\n- Implement ReAct agents\n- Use tool definitions\n- Leverage memory\n\n## Best Practices\n- Limit max iterations\n- Use verbose logging',
  
  'huggingface-models': '# Hugging Face Models\n\n## Key Patterns\n- Use transformers library\n- Implement pipeline API\n- Leverage model hubs\n\n## Best Practices\n- Use quantization\n- Batch process inputs',
  
  'gpu-acceleration': '# GPU Acceleration\n\n## Key Patterns\n- Use CUDA/Metal\n- Leverage WebGPU\n- Use compute shaders\n\n## Best Practices\n- Minimize CPU-GPU transfers\n- Use FP16',
  
  'wasm-deployment': '# WebAssembly Deployment\n\n## Key Patterns\n- Use Emscripten/wasm-pack\n- Implement progressive loading\n- Leverage SharedArrayBuffer\n\n## Best Practices\n- Compress wasm files\n- Use streaming instantiation',
  
  'cross-platform-build': '# Cross-Platform Build\n\n## Key Patterns\n- Use CMake\n- Implement conditional compilation\n- Leverage CI matrix builds\n\n## Best Practices\n- Test on all target platforms\n- Use platform abstraction layers',
  
  'python-bindings': '# Python Bindings\n\n## Key Patterns\n- Use pybind11 or PyO3\n- Implement proper error handling\n- Expose C++/Rust APIs\n\n## Best Practices\n- Document all exposed functions\n- Use type hints',
  
  'testing-jest': '# Testing with Jest\n\n## Key Patterns\n- Write unit and integration tests\n- Use mocks and spies\n- Implement snapshot testing\n\n## Best Practices\n- Test behavior not implementation\n- Use descriptive test names',
  
  'testing-vitest': '# Testing with Vitest\n\n## Key Patterns\n- Fast unit tests\n- ESM-first approach\n- Compatible with Jest API\n\n## Best Practices\n- Use watch mode during dev\n- Leverage fast HMR',
  
  'testing-pytest': '# Testing with Pytest\n\n## Key Patterns\n- Use fixtures for setup\n- Implement parametrized tests\n- Leverage pytest plugins\n\n## Best Practices\n- Use markers for test organization\n- Mock external dependencies',
  
  'error-handling': '# Error Handling\n\n## Key Patterns\n- Use Result types\n- Implement proper error types\n- Handle errors at boundaries\n\n## Best Practices\n- Never swallow errors silently\n- Provide context in error messages',
  
  'logging-monitoring': '# Logging & Monitoring\n\n## Key Patterns\n- Use structured logging\n- Implement log levels\n- Set up alerting\n\n## Best Practices\n- Log at appropriate levels\n- Monitor key metrics',
  
  'environment-config': '# Environment Configuration\n\n## Key Patterns\n- Use .env files for local dev\n- Validate env vars on startup\n- Use type-safe config objects\n\n## Best Practices\n- Never commit secrets\n- Document all env vars',
  
  'git-workflow': '# Git Workflow\n\n## Key Patterns\n- Use feature branches\n- Write meaningful commit messages\n- Implement code review\n\n## Best Practices\n- Keep commits atomic\n- Rebase before merging',
  
  'solid-principles': '# SOLID Principles\n\n## Key Patterns\n- Single Responsibility\n- Open/Closed\n- Liskov Substitution\n- Interface Segregation\n- Dependency Inversion\n\n## Best Practices\n- Apply pragmatically\n- Refactor when patterns emerge',
  
  'api-design': '# API Design\n\n## Key Patterns\n- Use RESTful conventions\n- Implement versioning\n- Provide clear error messages\n\n## Best Practices\n- Document all endpoints\n- Use consistent naming',
  
  'rate-limiting': '# Rate Limiting\n\n## Key Patterns\n- Implement sliding window\n- Use Redis for distributed limiting\n- Return proper headers\n\n## Best Practices\n- Set reasonable limits\n- Provide clear error messages',
  
  'security-patterns': '# Security Patterns\n\n## Key Patterns\n- Validate all inputs\n- Use prepared statements\n- Implement CSRF protection\n\n## Best Practices\n- Follow OWASP guidelines\n- Regular security audits',
  
  'cloudflare-workers': '# Cloudflare Workers\n\n## Key Patterns\n- Deploy edge functions\n- Use KV for storage\n- Leverage Durable Objects\n\n## Best Practices\n- Minimize cold starts\n- Use Wrangler CLI',
  
  'edge-computing': '# Edge Computing\n\n## Key Patterns\n- Deploy to edge locations\n- Use edge-compatible runtime\n- Minimize latency\n\n## Best Practices\n- Keep functions lightweight\n- Cache aggressively',
  
  'web-scraping': '# Web Scraping\n\n## Key Patterns\n- Use BeautifulSoup/Scrapy\n- Respect robots.txt\n- Implement rate limiting\n\n## Best Practices\n- Handle failures gracefully\n- Store data efficiently',
  
  'data-processing': '# Data Processing\n\n## Key Patterns\n- Use streaming for large datasets\n- Implement proper error handling\n- Leverage parallel processing\n\n## Best Practices\n- Validate input data\n- Monitor performance',
  
  'stream-processing': '# Stream Processing\n\n## Key Patterns\n- Use async iterators\n- Implement backpressure\n- Handle partial failures\n\n## Best Practices\n- Buffer appropriately\n- Monitor throughput',
  
  'file-handling': '# File Handling\n\n## Key Patterns\n- Use streaming for large files\n- Implement proper error handling\n- Validate file types\n\n## Best Practices\n- Clean up temp files\n- Handle encoding properly',
  
  'cli-tools': '# CLI Tools\n\n## Key Patterns\n- Use argument parser\n- Implement help text\n- Provide progress indicators\n\n## Best Practices\n- Follow Unix philosophy\n- Support piping',
  
  'java-spring': '# Java Spring Framework\n\n## Key Patterns\n- Use dependency injection\n- Implement RESTful APIs\n- Leverage Spring Boot\n\n## Best Practices\n- Use proper annotations\n- Implement proper testing',
  
  'mobile-pwa': '# Mobile PWA\n\n## Key Patterns\n- Implement service worker\n- Use responsive design\n- Support offline mode\n\n## Best Practices\n- Optimize for mobile\n- Test on real devices',
  
  'accessibility-a11y': '# Accessibility (a11y)\n\n## Key Patterns\n- Use semantic HTML\n- Implement ARIA attributes\n- Support keyboard navigation\n\n## Best Practices\n- Test with screen readers\n- Maintain color contrast',
  
  'internationalization': '# Internationalization (i18n)\n\n## Key Patterns\n- Use i18n libraries\n- Extract strings to translation files\n- Support RTL languages\n\n## Best Practices\n- Use locale-aware formatting\n- Test all languages',
  
  'component-library': '# Component Library\n\n## Key Patterns\n- Create reusable components\n- Document with Storybook\n- Implement proper typing\n\n## Best Practices\n- Follow consistent API\n- Version properly',
  
  'monorepo-setup': '# Monorepo Setup\n\n## Key Patterns\n- Use workspace tools (Turbo, Nx)\n- Share common configuration\n- Implement proper caching\n\n## Best Practices\n- Keep dependencies organized\n- Use proper task orchestration',
}
