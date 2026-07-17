"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FolderKanban, CheckSquare, MessageSquare, User, Brain, ArrowRight } from "lucide-react";
import { useGlobalSearch } from "@/hooks/useSearch";
import { SearchResult } from "@/types";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: searchResults, isLoading } = useGlobalSearch({
    q: query,
    page: 1,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project": return <FolderKanban className="h-4 w-4" />;
      case "task": return <CheckSquare className="h-4 w-4" />;
      case "comment": return <MessageSquare className="h-4 w-4" />;
      case "member": return <User className="h-4 w-4" />;
      case "ai_history": return <Brain className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project": return "text-purple-500";
      case "task": return "text-blue-500";
      case "comment": return "text-green-500";
      case "member": return "text-orange-500";
      case "ai_history": return "text-pink-500";
      default: return "text-muted-foreground";
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.link);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all w-64"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
          Ctrl+K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, tasks, comments..."
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
                ESC
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {query.length > 0 && searchResults && searchResults.results.length > 0 ? (
                <div className="space-y-0.5">
                  {searchResults.results.map((result: SearchResult) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-secondary/70 transition-colors text-left"
                    >
                      <div className={cn("p-1.5 rounded-lg bg-secondary", getTypeColor(result.type))}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{result.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 capitalize mt-0.5">{result.type.replace("_", " ")}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : query.length > 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No results found</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Type to search across everything</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Projects, tasks, comments, and more</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
