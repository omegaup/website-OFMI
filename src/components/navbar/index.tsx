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
  // Registro: "/registro",
  Reglamento: "/reglamento",
  "Código de conducta": "/conducta",
  Material: "/material",
  FAQ: "/faq",
  Donaciones: "/dona",
  "Únete al equipo": "/unete",
};

export type NavigationItem = keyof typeof navigation;

export const Navbar = (): JSX.Element => {
  const session = useSession();
  const pathname = usePathname();
  return (
    <Disclosure as="nav" className="bg-stone-300">
      {({ open }: { open: boolean }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <a key="index-icon" href="/">
                    <Image
                      className="h-8"
                      src="/lightLogo.svg"
                      alt="Inicio"
                      height={32}
                      width={32}
                    />
                  </a>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex items-center space-x-4">
                    {Object.entries(navigation).map(([name, href]) => (
                      <a
                        key={name}
                        href={href}
                        className={classNames(
                          href === pathname
                            ? "bg-gray-200"
                            : "hover:bg-gray-700 hover:text-white",
                          "rounded-md px-3 py-2 text-center text-sm font-medium text-gray-700",
                        )}
                        aria-current={href === pathname ? "page" : undefined}
                      >
                        {name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              {session.status === "authenticated" ? (
                <ProfileDropdown />
              ) : session.status === "unauthenticated" ? (
                <Unauthenticated />
              ) : (
                <></>
              )}
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {Object.entries(navigation).map(([name, href]) => (
                <Disclosure.Button
                  key={name}
                  as="a"
                  href={href}
                  className={classNames(
                    href === pathname
                      ? "bg-gray-200"
                      : "hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium text-gray-700",
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
