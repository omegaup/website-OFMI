import Text from "./Text";
import { Text as IText } from "@/types/input.types";

interface Birthday extends IText {
  ageRange: [number, number];
}

export default function ({ ageRange, ...others }: Birthday) {
  const [min, max] = ageRange;
  return (
    <p>
      <Text
        type="date"
        validate={{
          func: (val: string) => {
            const currYear = new Date(Date.now()).getFullYear();
            const birthYear = new Date(val).getFullYear();
            const age = currYear - birthYear;
            if (age < min || age > max) {
              return false;
            }
            return true;
          },
          message: `Debes tener entre ${min} y ${max} años para participar`,
        }}
        {...others}
      />
    </p>
  );
}
