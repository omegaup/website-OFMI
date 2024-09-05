export const SectionTitle = ({ title }: { title: string }): JSX.Element => {
  return (
    <h2 className="my-2 text-xl font-bold leading-9 tracking-tight text-gray-900">
      {title}
    </h2>
  );
};
