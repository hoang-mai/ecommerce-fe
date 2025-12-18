"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white relative">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url(/not-found-bg.png)" }}
      ></div>
      <div className="w-full text-center space-y-4 relative z-10">
        <div className="relative">
          <Image
            src="/not-found-icon.svg"
            alt="Not Found"
            width={0}
            height={0}
            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-[32rem] xl:h-[32rem] mx-auto"
          />
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-bold text-grey-c700">
              OOPS! PAGE NOT FOUND
            </h2>

            <p className="text-sm md:text-base lg:text-lg xl:text-xl text-grey-c500 leading-relaxed max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
              The page you&apos;re looking for is gone, but there are still other better pages to set your eyes on.
              Try exploring our site and you might find what you&apos;re looking for.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => router.push("/")}
              className="bg-primary-c700 hover:bg-primary-c800 transition duration-200 text-white px-12 py-4 rounded-full text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[200px]"
            >
              Go to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
