import Text from "./Text";
import { Text as IText } from "@/types/input.types";

export default function ({ name, ...others }: IText) {
  return (
    <p>
      <Text
        name={name}
        validate={{
          func: (val: string) => /^[a-zA-Z' ]+$/g.test(val),
          message: `El campo ${name} solo puede contener letras (sin acentos) y espacios`,
        }}
        {...others}
      />
    </p>
  );
}
