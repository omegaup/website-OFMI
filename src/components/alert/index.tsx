export const Alert = ({text}: {text: string}): JSX.Element => {
    return (
      <div
        className="relative rounded border border-red-400 bg-red-100 px-4 py-2 my-2 text-red-700 text-xs"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {text}</span>
      </div>
    );
}
