import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500">
          Built by{" "}
          <Link href="https://1labs.ai" className="text-pink-500 hover:text-pink-600 transition">
            1Labs.ai
          </Link>
          {" "}— Ship AI Products 10× Faster
        </p>
      </div>
    </footer>
  );
}
