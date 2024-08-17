import { ShirtSizes, ShirtStyles } from "@/types/shirt";
import { FloatingInput } from "@/components/input/FloatingInput";
import { SectionTitle } from "./sectionTitle";
import { PronounName, Pronouns } from "@/types/pronouns";

export function PersonalDetails(): JSX.Element {
  return (
    <div>
      <SectionTitle title="Datos de contacto" />
      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput type="text" label="Nombre(s)" id="first_name" required />
        <FloatingInput
          type="text"
          label="Apellido(s)"
          id="last_name"
          required
        />
      </div>
      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput
          type="text"
          id="preferred_name"
          label="Nombre preferido"
          placeholder=" "
        />
        <div className="group relative z-0 mb-5 w-full">
          <select
            id="pronouns"
            defaultValue={"Her"}
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
          >
            {Pronouns.map((value) => {
              return <option key={value}>{PronounName(value)}</option>;
            })}
          </select>
          <label
            htmlFor="pronouns"
            className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
          >
            Pronombre
          </label>
        </div>
      </div>
      <div className="grid md:grid-cols-2 md:gap-6">
        <FloatingInput
          type="date"
          id="birth_date"
          label="Fecha de nacimiento"
          placeholder=" "
          required
        />
        <FloatingInput
          type="text"
          id="government_id"
          label="CURP"
          placeholder=" "
          required
        />
      </div>

      {/* Shirt */}
      <div className="grid md:grid-cols-4 md:gap-6">
        <div className="group relative z-0 mb-5 w-full">
          <select
            id="shirt_size"
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
          >
            <option value=""></option>
            {ShirtSizes.map((value) => {
              return <option key={value}>{value}</option>;
            })}
          </select>
          <label
            htmlFor="shirt_size"
            className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
          >
            Talla de playera
          </label>
        </div>
        <div className="group relative z-0 mb-5 w-full">
          <select
            id="shirt_style"
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0"
          >
            <option value=""></option>
            {ShirtStyles.map((value) => {
              return <option key={value}>{value}</option>;
            })}
          </select>
          <label
            htmlFor="shirt_style"
            className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:start-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
          >
            Estilo de playera
          </label>
        </div>
      </div>
    </div>
  );
}
