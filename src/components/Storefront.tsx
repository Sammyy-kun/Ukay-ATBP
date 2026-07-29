import { ThriftItem } from "@/lib/types";
import { Shirt, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface StorefrontProps {
  items: ThriftItem[];
  onLoginClick: () => void;
}

export function Storefront({ items, onLoginClick }: StorefrontProps) {
  const [query, setQuery] = useState("");

  const availableItems = useMemo(() => {
    return items
      .filter((i) => i.status === "available")
      .filter(
        (i) =>
          query.trim() === "" ||
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          i.category.toLowerCase().includes(query.toLowerCase())
      );
  }, [items, query]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 shadow-sm">
              <Shirt className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">Ukay-Ukay</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              Seller Login
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Latest Finds</h1>
            <p className="mt-2 text-sm text-neutral-500">Discover pre-loved treasures at unbeatable prices.</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-neutral-200 py-2.5 pl-10 pr-4 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        {availableItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Shirt className="mb-4 h-12 w-12 text-neutral-300" />
            <h3 className="text-lg font-medium text-neutral-900">No items found</h3>
            <p className="mt-1 text-sm text-neutral-500">Check back later for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {availableItems.map((item) => (
              <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-md">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                  {item.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Shirt className="h-8 w-8 text-neutral-300" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-900 backdrop-blur-sm">
                    {item.size}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-1 text-sm font-medium text-neutral-900">{item.title}</h3>
                  <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
                    <span>{item.category}</span>
                    <span>{item.condition}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-lg font-bold text-neutral-900">₱{item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
