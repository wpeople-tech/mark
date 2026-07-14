'use client';

import { chat } from "./lib/llm";

export default function Home() {
  return (
    <main className="flex justify-center items-center min-h-screen">
      <button
        className="py-2 px-4 rounded-sm bg-blue-800 text-white hover:blue-700 duration-300"
        onClick={() => chat()}
      >Click Me</button>
    </main>
  )
}