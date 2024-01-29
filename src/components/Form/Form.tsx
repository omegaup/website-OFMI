import { useState } from "react";
import objHasKey from "@/utils/objHasKey";
import Inputs, { Errors, Values, ObjVals } from "../../types/input.types";

export interface Response {
  isError: null | boolean;
  message: string;
}

interface Submit {
  label: string;
  handler: (vals: ObjVals) => Response | Promise<Response>;
}

interface IForm {
  name: string;
  errors: Errors;
  values: Values;
  submit: Submit;
  children: Inputs | Array<Inputs | false>;
}

export default function Form({
  name,
  children,
  values,
  errors,
  submit,
}: IForm): JSX.Element {
  const [cantSubmit, setCantSubmit] = useState(true);
  const [showResponse, setShowResponse] = useState(false);
  const [submitResponse, setSubmitResponse] = useState<Response>({
    isError: null,
    message: "",
  });
  const stateManager = (child: Inputs): JSX.Element => {
    const { props, ...others } = child;
    const name = props.name;
    const val = {
      state: values.state[name],
      updater: (val: string): void => {
        if (!objHasKey(values.state, name)) {
          return;
        }
        values.updater({ ...values.state, [name]: val });
      },
    };
    const err = {
      state: errors.state[name],
      updater: (val: boolean): void => {
        const maxErrs = Object.keys(values.state).length;
        const value = Number(val);
        if (!objHasKey(values.state, name)) {
          return;
        }
        if (errors.state[name] === value) {
          return;
        }
        let count = errors.state.count;
        if (val) {
          count++;
        } else {
          count--;
        }
        if (count < 0) {
          count = 0;
        } else if (count > maxErrs) {
          count = maxErrs;
        }
        setCantSubmit(Boolean(count));
        errors.updater({
          ...errors.state,
          [name]: value,
          count,
        });
      },
    };
    return {
      props: {
        value: { ...val },
        error: { ...err },
        ...props,
      },
      ...others,
    };
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        let answer: Response = {
          isError: false,
          message: "Aún no has llenado correctamente todos los campos",
        };
        if (!cantSubmit) {
          answer = await submit.handler(values.state);
        }
        setSubmitResponse(answer);
        setShowResponse(true);
        setTimeout(setShowResponse, 5000, false);
      }}
    >
      <h1>{name}</h1>
      {!Array.isArray(children)
        ? stateManager(children)
        : children.map((child) => {
            return child && stateManager(child);
          })}
      {showResponse && <em>{submitResponse.message}</em>}
      <button type="submit">{submit.label}</button>
    </form>
  );
}
