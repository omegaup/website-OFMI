import Text from "./Text";
import { Text as IText } from "@/types/input.types";

export default function ({ name, ...others }: IText) {
  return (
    <p>
      <Text
        name={name}
        validate={{
          func: (val: string) => /^[a-zA-Z0-9' ]+$/g.test(val),
          message: `El campo ${name} solo puede contener letras y espacios`,
        }}
        {...others}
      />
    </p>
  );
}
