import { Text } from "@/types/input.types";
import { memo, isValidElement } from "react";

function Text({
  type,
  name,
  label,
  validate,
  value,
  error,
  isRequired = true,
  ...others
}: Text): false | JSX.Element {
  if (!value || !error || !validate) {
    return false;
  }
  return (
    <>
      {isValidElement(label) ? (
        { ...label, props: { htmlFor: name } }
      ) : (
        <label htmlFor={name}>{label}</label>
      )}
      <input
        id={name}
        name={name}
        value={value.state}
        onChange={(e) => {
          value.updater(e.target.value);
        }}
        onBlur={async (e) => {
          const isValid = await validate.func(e.target.value);
          error.updater(!isValid);
        }}
        type={type ? type : "text"}
        {...others}
      />
      {Boolean(value.state.length && error.state) && (
        <em>{validate.message}</em>
      )}
      {isRequired && error.state !== null && !value.state.length && (
        <em>{`El campo ${name} no puede estar vacío`}</em>
      )}
    </>
  );
}

export default memo(Text);
