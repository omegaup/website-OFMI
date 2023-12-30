export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export const navbarStyle = {
  textSize: "text-sm",
  textColor: {
    primary: "text-gray-300",
    secondary: "text-white",
  },
  hoverTextColor: {
    primary: "hover:text-white",
    secondary: "hover:text-gray-300",
  },
};
