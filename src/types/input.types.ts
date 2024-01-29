import Image from "next/image";
import { Object } from "@/utils/initializeDefaults";
import { ComponentProps, ReactElement, Dispatch, SetStateAction } from "react";

interface Response {
  isError: null | boolean;
  message: string;
}

interface FieldErrs {
  [key: string]: null | number;
}

interface State<Type> {
  state: Type;
  updater: Dispatch<SetStateAction<Type>>;
}

interface Input {
  name: string;
  label: string | ReactElement;
  error?: State<null | boolean>;
  value?: State<string>;
  isRequired?: boolean;
  placeholder?: string;
}

interface Option {
  val: string;
  label?: string;
  image?: ComponentProps<typeof Image>;
}

export interface Validation {
  func: (value: string) => boolean | Promise<boolean>;
  message: string;
}

export interface Text extends Input {
  type?: "email" | "number" | "date" | "search" | "password";
  list?: string;
  validate?: Validation;
}

export interface Options extends Input {
  options: string[] | Option[];
  type: "radio" | "checkbox";
}

export interface DataList extends Input {
  options: string[] | false;
  validation: "strict" | RegExp;
}

type Inputs =
  | ReactElement<Options>
  | ReactElement<DataList>
  | ReactElement<Text>;

export type ObjVals = Object<string>;

export interface ObjErrs extends FieldErrs {
  count: number;
}

export type Values = State<ObjVals>;

export type Errors = State<ObjErrs>;

export type Handler = (val: ObjVals) => Response | Promise<Response>;

export default Inputs;
