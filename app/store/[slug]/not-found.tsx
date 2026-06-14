export default function StoreNotFound() {
  return (
    <div className="min-h-screen bg-[#FFFAF0] flex flex-col items-center justify-center gap-4 px-4 font-sans">
      <div className="text-6xl select-none">🍽️</div>
      <h1 className="text-[28px] font-black text-[#0D102B] text-center m-0">
        Store Not Found
      </h1>
      <p className="text-[#6B6B78] text-center max-w-sm m-0">
        The store you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <a
        href="/"
        className="mt-2 px-6 py-3 rounded-[12px] bg-[#F5A142] text-white font-extrabold text-sm no-underline hover:opacity-90 transition-opacity"
      >
        Back to Home
      </a>
    </div>
  );
}
