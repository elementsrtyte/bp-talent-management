/** Lowercase whole-tag overrides (exact match after trim + lower). */
const TAG_ALIASES: Record<string, string> = {
  ai: "AI",
  ml: "ML",
  qa: "QA",
  ux: "UX",
  ui: "UI",
  api: "API",
  aws: "AWS",
  gcp: "GCP",
  sql: "SQL",
  nosql: "NoSQL",
  ios: "iOS",
  sdk: "SDK",
  cdn: "CDN",
  iot: "IoT",
  nlp: "NLP",
  ar: "AR",
  vr: "VR",
  xr: "XR",
  bi: "BI",
  erp: "ERP",
  crm: "CRM",
  sso: "SSO",
  jwt: "JWT",
  html: "HTML",
  css: "CSS",
  php: "PHP",
  kmm: "KMM",
  graphql: "GraphQL",
  devops: "DevOps",
  rest: "REST",
  grpc: "gRPC",
  oauth: "OAuth",
  oidc: "OIDC",
  ldap: "LDAP",
  tcp: "TCP",
  udp: "UDP",
  http: "HTTP",
  https: "HTTPS",
  websocket: "WebSocket",
  websockets: "WebSockets",
  kubernetes: "Kubernetes",
  kafka: "Kafka",
  redis: "Redis",
  mongodb: "MongoDB",
  postgres: "Postgres",
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  sqlite: "SQLite",
  elasticsearch: "Elasticsearch",
  dynamodb: "DynamoDB",
  firebase: "Firebase",
  supabase: "Supabase",
  terraform: "Terraform",
  ansible: "Ansible",
  jenkins: "Jenkins",
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  jira: "Jira",
  confluence: "Confluence",
  figma: "Figma",
  sketch: "Sketch",
  webpack: "Webpack",
  vite: "Vite",
  babel: "Babel",
  eslint: "ESLint",
  prettier: "Prettier",
  jest: "Jest",
  cypress: "Cypress",
  playwright: "Playwright",
  selenium: "Selenium",
  fullstack: "Fullstack",
  frontend: "Frontend",
  backend: "Backend",
  web3: "Web3",
  blockchain: "Blockchain",
  ethereum: "Ethereum",
  solidity: "Solidity",
  kotlin: "Kotlin",
  swift: "Swift",
  dart: "Dart",
  golang: "Go",
  rust: "Rust",
  scala: "Scala",
  clojure: "Clojure",
  elixir: "Elixir",
  django: "Django",
  flask: "Flask",
  rails: "Rails",
  laravel: "Laravel",
  spring: "Spring",
  dotnet: ".NET",
  angular: "Angular",
  vue: "Vue",
  svelte: "Svelte",
  ember: "Ember",
  nextjs: "Next.js",
  next: "Next.js",
  nuxt: "Nuxt",
  remix: "Remix",
  electron: "Electron",
  capacitor: "Capacitor",
  ionic: "Ionic",
  xamarin: "Xamarin",
  maui: "MAUI",
  unity: "Unity",
  unreal: "Unreal",
  opengl: "OpenGL",
  vulkan: "Vulkan",
  metal: "Metal",
  directx: "DirectX",
  ffmpeg: "FFmpeg",
  opencv: "OpenCV",
  pytorch: "PyTorch",
  tensorflow: "TensorFlow",
  keras: "Keras",
  pandas: "Pandas",
  numpy: "NumPy",
  scipy: "SciPy",
  spark: "Spark",
  hadoop: "Hadoop",
  snowflake: "Snowflake",
  databricks: "Databricks",
  tableau: "Tableau",
  looker: "Looker",
  mixpanel: "Mixpanel",
  amplitude: "Amplitude",
  segment: "Segment",
  stripe: "Stripe",
  twilio: "Twilio",
  sendgrid: "SendGrid",
  salesforce: "Salesforce",
  hubspot: "HubSpot",
  shopify: "Shopify",
  woocommerce: "WooCommerce",
  magento: "Magento",
  bigcommerce: "BigCommerce",
};

/** Single-token lowercase overrides (per word). */
const WORD_ALIASES: Record<string, string> = {
  ai: "AI",
  ml: "ML",
  qa: "QA",
  ux: "UX",
  ui: "UI",
  api: "API",
  aws: "AWS",
  gcp: "GCP",
  sql: "SQL",
  ios: "iOS",
  js: "JavaScript",
  ts: "TypeScript",
  rn: "React Native",
  kmm: "KMM",
  android: "Android",
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  vuejs: "Vue.js",
};

const MINOR_WORDS = new Set([
  "on",
  "and",
  "or",
  "the",
  "of",
  "to",
  "in",
  "for",
  "with",
  "via",
]);

function capitalizeWord(word: string): string {
  if (!word) return word;
  const lower = word.toLowerCase();
  if (WORD_ALIASES[lower]) return WORD_ALIASES[lower];
  // node.js, three.js, etc.
  if (lower.includes(".js")) {
    const base = lower.replace(/\.js$/i, "");
    if (!base) return "JavaScript";
    const baseFmt =
      WORD_ALIASES[base] ??
      base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
    return `${baseFmt}.js`;
  }
  // C++, C#
  if (lower === "c++" || lower === "c + +" || lower === "c+") return "C++";
  if (lower === "c#") return "C#";
  if (lower === ".net" || lower === "dotnet") return ".NET";
  // react-native style
  if (lower.includes("-")) {
    return lower
      .split("-")
      .map((seg) => {
        const s = seg.toLowerCase();
        return WORD_ALIASES[s] ?? capitalizeWord(seg);
      })
      .join("-");
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Format one skill segment (often one comma-separated tag) for display.
 */
export function formatSkillTag(raw: string): string {
  const t = raw.trim().replace(/\s+/g, " ");
  if (!t) return "";
  if (/^c\s*\+\s*\+$/i.test(t)) return "C++";
  const lowerWhole = t.toLowerCase();
  if (TAG_ALIASES[lowerWhole]) return TAG_ALIASES[lowerWhole];
  // e.g. react/node
  if (t.includes("/") && !t.includes(" ")) {
    return t
      .split("/")
      .map((seg) => formatSkillTag(seg.trim()))
      .filter(Boolean)
      .join("/");
  }
  // Multi-word: "ruby on rails", "react native"
  const words = t.split(/\s+/);
  if (words.length === 1) {
    return capitalizeWord(words[0]!);
  }
  return words
    .map((w, i) => {
      const lw = w.toLowerCase();
      if (i > 0 && MINOR_WORDS.has(lw)) return lw;
      return capitalizeWord(w);
    })
    .join(" ");
}
