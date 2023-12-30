import Text from "./Text";

interface Input {
    name: string;
    type: 'first' | 'last' | 'full';
};

export default function({ type, name }: Input) {
    let label = 'Nombre Completo';
    if (type === 'first') {
        label = 'Nombre(s)';
    } else if (type === 'last') {
        label = 'Apellido(s)'
    };
    return (
        <Text name={name} label={label} />
    );
};