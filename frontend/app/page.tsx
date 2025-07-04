'use client';
import Link from 'next/link';
import '@/styles/globals.css' ;
import { useRef } from 'react';

export default function Home() {
  const subheaderRef = useRef<HTMLParagraphElement>(null);
  const mainTitleRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      {/* Background Image */}
      <div className="fixed inset-0 bg-[url('/BG.jpg')] bg-cover bg-center brightness-100 -z-30" aria-hidden="true" />
      <div className="fixed inset-0 bg-[rgba(65,9,9,0.5)] -z-20" aria-hidden="true" />

      {/* Main Content */}
      <main className="flex flex-col justify-center items-center text-center h-screen w-full px-4 font-['Prompt'] overflow-hidden relative z-10 space-y-6">
<p
  ref={subheaderRef}
  className="uppercase text-[clamp(1.1rem,2.5vw,1.6rem)] tracking-[0.25em] font-bold bg-gradient-to-r from-white to-[#e2e2ff] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.08)] animate-[text-scale-fade-in_1.9s_ease-out_forwards] mb-4"
>
  Chase the unknown
</p>

  <h1
    ref={mainTitleRef}
    className="font-black leading-[0.8] uppercase text-[clamp(4rem,20vw,18rem)] text-center bg-[url('/BG3.jpg')] bg-center bg-cover bg-clip-text text-transparent animate-[text-scale-fade-in_1.9s_ease-out_forwards] mt-2 mb-6"
  >
    <span>HIDDEN</span><br />
    <span>HORIZONS</span>
  </h1>

  <Link href="/explore">
    <button className="styled-button px-8 py-4 text-lg font-bold text-focus-in mt-6">
      BUILD MY JOURNEY
    </button>
  </Link>
</main>


      {/* Keyframes */}
      <style jsx>{`
        @keyframes text-scale-fade-in {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
