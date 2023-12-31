import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ProfileDropdown } from "./Profile";
import { Unauthenticated } from "./Unauthenticated";
import { classNames } from "./styles";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { useEffect, useState } from "react";
import { Session } from "next-auth";

const navigation = {
  Material: "material",
  Convocatoria: "convocatoria",
  FAQ: "faq",
};

export type NavigationItem = keyof typeof navigation;

export const Navbar = ({
  activeItem,
}: {
  activeItem?: NavigationItem;
}): JSX.Element => {
  const [session, setSession] = useState<Session>();
  useEffect(() => {
    async function getSessionAsync(): Promise<void> {
      const s = (await getServerSession(authOptions)) ?? undefined;
      setSession(s);
    }
    getSessionAsync();
  }, []);
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
                  <img className="h-9" src="/lightLogo.svg" alt="OFMI" />
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {Object.entries(navigation).map(([name, href]) => (
                      <a
                        key={name}
                        href={href}
                        className={classNames(
                          name === activeItem
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-700 hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium",
                        )}
                        aria-current={name === activeItem ? "page" : undefined}
                      >
                        {name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              {session?.user != null ? (
                <ProfileDropdown />
              ) : (
                <Unauthenticated />
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
                    name === activeItem
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium",
                  )}
                  aria-current={name === activeItem ? "page" : undefined}
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
