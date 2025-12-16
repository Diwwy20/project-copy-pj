export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-center items-center gap-2 text-xs">
        <div className="font-bold text-gray-600 tracking-wide">
          Product Copy PJ
        </div>

        <div className="text-gray-400">
          &copy; {currentYear} All rights reserved.
        </div>
      </div>
    </footer>
  );
};
