import ProfileImageData from "public/profile.png";
import { classNames } from "./styles";
import Image from "next/image";

import { Menu, Transition } from "@headlessui/react";
import { signOut } from "next-auth/react";
import { Fragment } from "react";

export const ProfileDropdown = (): JSX.Element => {
  return (
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
      <Menu as="div" className="relative ml-3">
        <div>
          <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
            <span className="absolute -inset-1.5" />
            <span className="sr-only">Open user menu</span>
            <Image className="h-8 w-8 " src={ProfileImageData} alt="" />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <a
                  href="mentorias"
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700",
                  )}
                >
                  Mentorías
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <a
                  href="updateContactData"
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700",
                  )}
                >
                  Actualizar datos
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <a
                  href="/repository"
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700",
                  )}
                  target="_blank"
                >
                  Ver mi carpeta
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700",
                  )}
                  onClick={() => signOut()}
                >
                  Cerrar sesión
                </a>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
