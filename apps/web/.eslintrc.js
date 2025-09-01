module.exports = {
  extends: ["next/core-web-vitals"],
  ignorePatterns: ["**/*.spec.tsx", "**/*.test.tsx", "**/*.spec.ts", "**/*.test.ts"],
  rules: {
    // Regras específicas para o Next.js
    "@next/next/no-html-link-for-pages": "off",
  },
}
