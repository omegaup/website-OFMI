interface Input {
    name: string;
    type: 'first' | 'last' | 'full';
};

export default function({ type, name, ...others }: Input) {
    let label = 'Nombre Completo';
    if (type === 'first') {
        label = 'Nombre(s)';
    } else if (type === 'last') {
        label = 'Apellido(s)'
    };
    return (
        <input 
            type="text" 
            name={name} 
            id={name}
            {...others}
        >
            {label}
        </input>
    );
};