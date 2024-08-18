import classnames from "classnames";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  errorTitle?: string | null;
  errorMsg?: string;
}

export const Alert = ({
  className,
  errorTitle = "Error!",
  errorMsg,
  children,
  ...rest
}: AlertProps): JSX.Element => {
  return (
    <div
      className={classnames(
        "relative my-2 rounded border border-red-400 bg-red-100 px-4 py-2 text-red-700",
        className,
      )}
      role="alert"
      {...rest}
    >
      {errorTitle ? <strong className="font-bold">{errorTitle} </strong> : null}
      {errorMsg ? <span className="block sm:inline">{errorMsg}</span> : null}
      {children}
    </div>
  );
};

export interface SuccessAlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  text: string;
}

export const SuccessAlert = ({
  title,
  text,
  children,
  ...rest
}: SuccessAlertProps): JSX.Element => {
  return (
    <div
      className="my-2 rounded-b border-t-4 border-teal-500 bg-teal-100 px-4 py-3 text-teal-900 shadow-md"
      role="alert"
      {...rest}
    >
      <div className="flex">
        <div className="py-1">
          <svg
            className="mr-4 h-6 w-6 fill-current text-teal-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
          </svg>
        </div>
        <div>
          <p className="font-bold">{title ?? "¡Listo!"}</p>
          <p className="text-sm">{text}</p>
          {children}
        </div>
      </div>
    </div>
  );
};
