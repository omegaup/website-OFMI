export interface Object<Type> {
    [key: string]: Type;
};

export default function<Type>(keys: string[], val: Type) {
    let object: Object<Type> = {};
    for (const key of keys) {
        object[key] = val;
    };
    return object;
};