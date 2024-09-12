import type { MDXComponents } from "mdx/types";

function CustomH1({
  children,
}: React.HTMLAttributes<HTMLHeadElement>): JSX.Element {
  return <h1 className="text-center">{children}</h1>;
}

function CustomP({
  children,
}: React.HTMLAttributes<HTMLParagraphElement>): JSX.Element {
  return <p className="text-justify">{children}</p>;
}

function CustomLi({
  children,
}: React.HTMLAttributes<HTMLLIElement>): JSX.Element {
  return <li className="text-justify">{children}</li>;
}

function CustomA({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element {
  return (
    <a className="text-justify hover:text-blue-700" {...props}>
      {children}
    </a>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: CustomH1,
    p: CustomP,
    li: CustomLi,
    a: CustomA,
    wrapper: ({ children }) => (
      <div className="relative flex flex-1 flex-col overflow-hidden bg-gray-50 py-8 lg:py-12">
        <article className="prose prose-slate mx-auto px-4 lg:prose-lg md:mt-8 md:px-0">
          {children}
        </article>
      </div>
    ),
    ...components,
  };
}
