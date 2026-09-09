export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 px-4 sm:px-8 lg:px-12 py-10">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white">HackerRank</span>
          <span className="inline-block h-3 w-3 rounded-[3px] bg-hr-green-bright" />
        </div>
        <p className="text-xs text-[#6b7280]">
          © {new Date().getFullYear()} HackerRank. Skills for a GenAI world.
        </p>
        <div className="flex gap-4 text-xs text-[#9ca3af]">
          <a href="#products" className="hover:text-white">
            Products
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#signup" className="hover:text-white">
            Sign Up
          </a>
        </div>
      </div>
    </footer>
  );
}
