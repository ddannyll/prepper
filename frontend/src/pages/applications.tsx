import { backendAPI } from "@/service/API";
import { Transition } from "@headlessui/react";
import { HomeIcon, UsersIcon } from "@heroicons/react/24/outline";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const navigation = [
  { name: "My Applications", href: "#", icon: HomeIcon, current: true },
  { name: "My Info", href: "#", icon: UsersIcon, current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ApplicationPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleButtonClick = () => {
    console.log("clicked");
    setIsFormOpen(!isFormOpen);
  };

  console.log(isFormOpen);

  return (
    <>
      <div>
        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6">
            <div className="flex h-16 shrink-0 items-center">
              <HomeIcon className="h-16 w-16" />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-indigo-700 text-white"
                              : "text-indigo-200 hover:text-white hover:bg-indigo-700",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-white"
                                : "text-indigo-200 group-hover:text-white",
                              "h-6 w-6 shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="-mx-6 mt-auto">
                  <a
                    href="#"
                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700"
                  >
                    <img
                      className="h-8 w-8 rounded-full bg-indigo-700"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />

                    {/* <Image
                      className="h-8 w-8 rounded-full bg-indigo-700"
                      src={
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      }
                      alt=""
                      fill
                    /> */}
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true">User!</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <main className="py-10 lg:pl-72 border-2 border-dashed border-red-900">
          <div className="px-4 sm:px-6 lg:px-8 border-dashed border-2 border-red-900">
            {/* wide button with '+' */}
            <div className="flex justify-items-center">
              <button
                onClick={handleButtonClick}
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 mx-auto"
              >
                {!isFormOpen && <IconPlus />}
                {isFormOpen && <IconMinus />}
                New Application
              </button>

              {/* open a form here to create a new form */}
            </div>
            <Transition
              show={isFormOpen}
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="mt-4">
                This is a lil form to create an Application
                {/* TODO FORM*/}
                <form className="bg-white p-4 rounded shadow">
                  {/* Form fields go here */}
                  <input type="text" placeholder="Company Name" />
                </form>
              </div>
            </Transition>
          </div>
        </main>
      </div>
    </>
  );
}
