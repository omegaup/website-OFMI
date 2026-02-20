import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { ProfileDropdown } from "./Profile";
import { Unauthenticated } from "./Unauthenticated";
import { classNames } from "./styles";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const navigation = {
  Convocatoria: "/convocatoria",
  //   "Convocatoria sedes": "/sedes",
  "Sedes 5ta OFMI": "/sedes-5ta-ofmi",
  Registro: "/registro",
  Reglamento: "/reglamento",
  "Código de conducta": "/conducta",
  Material: "/material",
  FAQ: "/faq",
  Donaciones: "/dona",
  //Resultados: "/resultados",
};

export type NavigationItem = keyof typeof navigation;

export const Navbar = (): JSX.Element => {
  const session = useSession();
  const pathname = usePathname();

  const navEntries = Object.entries(navigation);
  const mainNav = navEntries.slice(0, 4);
  const extraNav = navEntries.slice(4);

  return (
    <Disclosure as="nav" className="bg-stone-300">
      {({ open }: { open: boolean }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>

                {/* Logo */}
                <div className="flex flex-shrink-0 items-center">
                  <a key="index-icon" href="/">
                    <Image
                      className="h-8 w-auto"
                      src="/lightLogo.svg"
                      alt="Inicio"
                      height={32}
                      width={32}
                    />
                  </a>
                </div>
              </div>

              <div className="hidden flex-1 lg:block lg:px-8">
                <div className="flex items-center justify-around space-x-2">
                  {mainNav.map(([name, href]) => (
                    <a
                      key={name}
                      href={href}
                      className={classNames(
                        href === pathname
                          ? "bg-stone-400 text-white"
                          : "text-gray-700 hover:bg-gray-700 hover:text-white",
                        "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      )}
                      aria-current={href === pathname ? "page" : undefined}
                    >
                      {name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                {session.status === "authenticated" ? (
                  <ProfileDropdown />
                ) : session.status === "unauthenticated" ? (
                  <Unauthenticated />
                ) : (
                  <div className="h-8 w-8" />
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:border-t lg:border-stone-400/20">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <div className="lg:hidden">
                {mainNav.map(([name, href]) => (
                  <Disclosure.Button
                    key={name}
                    as="a"
                    href={href}
                    className={classNames(
                      href === pathname
                        ? "bg-stone-400 text-white"
                        : "text-gray-700 hover:bg-gray-700 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium",
                    )}
                    aria-current={href === pathname ? "page" : undefined}
                  >
                    {name}
                  </Disclosure.Button>
                ))}
              </div>

              {extraNav.map(([name, href]) => (
                <Disclosure.Button
                  key={name}
                  as="a"
                  href={href}
                  className={classNames(
                    href === pathname
                      ? "bg-stone-400 text-white"
                      : "text-gray-700 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium",
                  )}
                  aria-current={href === pathname ? "page" : undefined}
                >
                  {name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
