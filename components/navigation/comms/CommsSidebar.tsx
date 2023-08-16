import React from "react";
import { Image, useColorMode } from "@chakra-ui/react";

function CommsSidebar() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <section
      className={`flex flex-col w-20 ${
        colorMode === `light` ? `bg-white` : `bg-dark`
      } border-r-2 border-gray-100 h-screen overflow-y-auto`}
    >
      <div className="w-16 mx-auto my-12 p-4 bg-gray-200 rounded-full text-black">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
        >
          <path
            d="M3 10H21M3 14H21M3 18H21M3"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <nav className="relative flex flex-col py-4 items-center">
        <a
          href="#!"
          className={`relative w-full px-4 py-2 ${
            colorMode === `light` ? `bg-blue-100` : `bg-white`
          } text-sky-600 border-l-4 border-blue-400  flex justify-center items-center`}
        >
          <svg
            width={30}
            height={30}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
          >
            <path
              d="M3 12V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.0799 19 6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V12M3 12H6.67452C7.16369 12 7.40829 12 7.63846 12.0553C7.84254 12.1043 8.03763 12.1851 8.21657 12.2947C8.4184 12.4184 8.59136 12.5914 8.93726 12.9373L9.06274 13.0627C9.40865 13.4086 9.5816 13.5816 9.78343 13.7053C9.96237 13.8149 10.1575 13.8957 10.3615 13.9447C10.5917 14 10.8363 14 11.3255 14H12.6745C13.1637 14 13.4083 14 13.6385 13.9447C13.8425 13.8957 14.0376 13.8149 14.2166 13.7053C14.4184 13.5816 14.5914 13.4086 14.9373 13.0627L15.0627 12.9373C15.4086 12.5914 15.5816 12.4184 15.7834 12.2947C15.9624 12.1851 16.1575 12.1043 16.3615 12.0553C16.5917 12 16.8363 12 17.3255 12H21M3 12L5.32639 6.83025C5.78752 5.8055 6.0181 5.29312 6.38026 4.91755C6.70041 4.58556 7.09278 4.33186 7.52691 4.17615C8.01802 4 8.57988 4 9.70361 4H14.2964C15.4201 4 15.982 4 16.4731 4.17615C16.9072 4.33186 17.2996 4.58556 17.6197 4.91755C17.9819 5.29312 18.2125 5.8055 18.6736 6.83025L21 12"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="absolute -top-3 -right-0 bg-red-600 h-6 w-6 p-2 flex justify-center items-center text-white rounded-full">
            3
          </span>
        </a>
        <a
          href="#!"
          className={`w-full px-4 py-2 flex ${
            colorMode === `light` ? `text-black` : `text-white `
          } justify-center items-center`}
        >
          <svg
            width={30}
            height={30}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
          >
            <path
              d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <a
          href="#!"
          className={`w-full px-4 py-2 flex ${
            colorMode === `light` ? `text-black` : `text-white`
          } justify-center items-center`}
        >
          <svg
            width={30}
            height={30}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="miter"
          >
            <polygon points="3 3 20 12 3 21 6 12 3 3" />
            <line x1="10" y1="12" x2="6" y2="12" />
          </svg>
        </a>
        <a
          href="#!"
          className={`w-full px-4 py-2 flex ${
            colorMode === `light` ? `text-black` : `text-white`
          } justify-center items-center`}
        >
          <svg
            width={30}
            height={30}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              opacity="0.5"
              cx="12"
              cy="9"
              r="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              opacity="0.5"
              d="M17.9691 20C17.81 17.1085 16.9247 15 11.9999 15C7.07521 15 6.18991 17.1085 6.03076 20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </a>
        <a
          href="#!"
          className={`w-full px-4 py-2 flex ${
            colorMode === `light` ? `text-black` : `text-white`
          } justify-center items-center`}
        >
          <svg
            width={30}
            height={30}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M39.5,15.5h-9a2,2,0,0,1-2-2v-9h-18a2,2,0,0,0-2,2v35a2,2,0,0,0,2,2h27a2,2,0,0,0,2-2Z" />
            <line x1="28.5" y1="4.5" x2="39.5" y2="15.5" />
          </svg>
        </a>
        <a
          href="#!"
          className={`w-full px-4 py-2 flex ${
            colorMode === `light` ? `text-black` : `text-white`
          } justify-center items-center`}
        >
          <svg
            width={30}
            height={30}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            fill="none"
          >
            <polygon points="16.35 1.5 7.65 1.5 1.5 7.65 1.5 16.35 7.65 22.5 16.35 22.5 22.5 16.35 22.5 7.65 16.35 1.5" />
            <line x1="12" y1="6.27" x2="12" y2="13.91" />
            <line x1="12" y1="15.82" x2="12" y2="17.73" />
          </svg>
        </a>
        <a
          href="#!"
          className={`w-full px-4 py-2 flex ${
            colorMode === `light` ? `text-black` : `text-white`
          } justify-center items-center`}
        >
          <svg
            width={30}
            height={30}
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 11V17"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 11V17"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 7H20"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <div className="w-12 border-b-2 border-gray-300 my-8" />
        <a href="#!" className="w-5 p-1 bg-gray-200 rounded-md text-black mb-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
          >
            <path
              d="M12 6V18"
              stroke="#000000"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 12H18"
              stroke="#000000"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <a href="#!" className="w-5 mb-3">
          <Image src="/label-1.png" alt="label1" />
        </a>
        <a href="#!" className="w-5 mb-3">
          <Image src="/label-2.png" alt="label2" />
        </a>
        <a href="#!" className="w-5 mb-3">
          <Image src="/label-3.png" alt="label3" />
        </a>
        <a href="#!" className="w-5 mb-3">
          <Image src="/label-4.png" alt="label4" />
        </a>
      </nav>

      <div className="mt-auto flex h-16 w-full items-center justify-center">
        {colorMode === "light" && (
          <div
            onClick={toggleColorMode}
            className="w-10 h-10 my-5 bg-gray-200 dark:bg-white hover:bg-gray-500 rounded-full cursor-pointer items-center justify-center flex"
          >
            <Image src="/moon.png" w={5} h={5} />
          </div>
        )}
        {colorMode === "dark" && (
          <div
            onClick={toggleColorMode}
            className="w-10 h-10 my-5 bg-white hover:bg-gray-500 rounded-full cursor-pointer items-center justify-center flex"
          >
            <Image src="/sun.png" w={5} h={5} />
          </div>
        )}
      </div>
    </section>
  );
}

export default CommsSidebar;
