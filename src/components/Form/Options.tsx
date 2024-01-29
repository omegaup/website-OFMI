import Image from "next/image";
import objHasKey from "@/utils/objHasKey";
import { useState, isValidElement, memo } from "react";
import { Options as IOptions } from "@/types/input.types";
import initializeDefaults from "@/utils/initializeDefaults";

function Options({
  type,
  name,
  label,
  options,
  value,
  error,
  isRequired = true,
}: IOptions) {
  if (!value || !error) {
    return false;
  }
  const values: string[] = options.map((v) => {
    if (typeof v === "string") {
      return v;
    }
    return v.val;
  });
  const defaults = initializeDefaults(values, false);
  const selected = value.state.split(", ");
  const [state, setState] = useState({
    ...defaults,
    ...initializeDefaults(selected, true),
  });
  return (
    <fieldset>
      {isValidElement(label) ? label : <legend>{label}</legend>}
      <ul>
        {options.map((option) => {
          const isString = typeof option === "string";
          const v = isString ? option : option.val;
          return (
            <li key={v}>
              {!isString && option.image && <Image {...option.image} />}
              <input
                type={type}
                name={name}
                id={`${name}-${v}`}
                value={v}
                onChange={(e) => {
                  const { value } = e.target;
                  const isValidKey = objHasKey(state, value);
                  error.updater(!isValidKey);
                  if (!isValidKey) {
                    return;
                  }
                  let prevState = state;
                  if (type === "radio") {
                    prevState = defaults;
                  }
                  const prevVal = state[value];
                  setState({ ...prevState, [value]: !prevVal });
                }}
                checked={state[v]}
                onBlur={() => {
                  const selected = Object.keys(state).filter((key) => {
                    return state[key] === true;
                  });
                  value.updater(selected.join(", "));
                }}
              />
              <label htmlFor={`${name}-${v}`}>
                {isString ? option : option.label}
              </label>
            </li>
          );
        })}
      </ul>
      {error.state === true && <em>{`La opcion ${value} no es valida`}</em>}
      {isRequired && error.state === false && !value.state.length && (
        <em>{`Debes seleccionar ${
          type === "checkbox" ? "almenos una" : "una"
        } opción del campo ${name}`}</em>
      )}
    </fieldset>
  );
}

export default memo(Options);
