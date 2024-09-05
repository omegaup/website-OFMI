export { validateCURP } from "./curp";
export {
  validateMailingAddressLocation,
  validateCountryState,
} from "./address";
export { validateGraduationDate, validateSchoolGrade } from "./school";

export const emailReg = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
