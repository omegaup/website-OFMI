import Results from "./_index.mdx";
import styles from "./index.module.css";

function CustomTable({
  children,
}: React.TableHTMLAttributes<HTMLTableElement>): JSX.Element {
  return <table className={styles.mdx_table}>{children}</table>;
}

const overrideComponents = {
  table: CustomTable,
};

export default function Page(): JSX.Element {
  return <Results components={overrideComponents} />;
}
