import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => (
      <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-8 lg:py-12">
        <article className="prose prose-slate lg:prose-lg mx-auto mt-8">
          {children}
        </article>
      </div>
    ),
    ...components,
  };
}
