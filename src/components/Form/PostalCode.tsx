import Text from "./Text";
import { Text as IText } from "@/types/input.types";

export default function ({ name, ...others }: IText) {
  return (
    <p>
      <Text
        name={name}
        validate={{
          func: (val: string) => /[0-9]{5}/g.test(val),
          message: `El campo ${name} debe contener 5 digitos del 0 al 9 (sin espacios)`,
        }}
        {...others}
      />
    </p>
  );
}
