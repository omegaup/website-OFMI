import Text from "./Text";
import { Text as IText } from "@/types/input.types";

interface Number extends IText {
  range?: [number, number];
}

export default function ({ name, range, ...others }: Number) {
  const [start, end] = range || [1, Infinity];
  const isDefaultRange = start === 1 && end === Infinity;
  return (
    <p>
      <Text
        type="number"
        name={name}
        validate={{
          func: (value: string) => {
            const num = Number(value);
            if (Number.isNaN(num) || num < start || num > end) {
              return false;
            }
            return true;
          },
          message: `El campo ${name} solo admite un número ${
            isDefaultRange
              ? "positivo mayor que uno"
              : `entre ${start} y ${end}`
          }`,
        }}
        {...others}
      />
    </p>
  );
}
