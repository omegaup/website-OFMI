import Text from "./Text";
import { memo } from "react";
import { DataList as IDataList } from "@/types/input.types";

function DataList({ name, options, validation, ...others }: IDataList) {
    const isStrict = validation === 'strict';
    if (!options && isStrict) {
        return false;
    };
    let tester = (val: string) => ((options as string[]).includes(val));
    if (!isStrict) {
        tester = (val: string) => (validation.test(val));
    };
    return (
        <p>
            <Text
                name={name}
                list={`${name}-opts`}
                validate={{
                    func: tester,
                    message: `El valor del campo ${name} no es válido`
                }}
                {...others}
            />
            {options && (
                <datalist id={`${name}-opts`}>
                    {options.map((value) => {
                        return <option key={value} value={value}>{value}</option>;
                    })}
                </datalist>
            )}
        </p>
    );
};

export default memo(DataList);