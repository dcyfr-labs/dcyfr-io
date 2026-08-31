'use client';

import { useState, useRef } from 'react';
import { clsx } from 'clsx';

interface SearchSuggestion {
  label: string;
  description: string;
  destination: string;
  tld: string;
}

const ROUTING_RULES: Array<{
  keywords: string[];
  tld: string;
  destination: string;
  description: string;
}> = [
  { keywords: ['template', 'starter', 'next.js', 'react', 'node', 'graphql', 'chatbot', 'rag', 'sandbox'], tld: 'dcyfr.app',   destination: 'https://dcyfr.app',   description: 'Browse templates' },
  { keywords: ['research', 'blog', 'article', 'whitepaper', 'guide', 'context engineering', 'prompt'],      tld: 'dcyfr.tech',  destination: 'https://dcyfr.tech',  description: 'Search research hub' },
  { keywords: ['snippet', 'pattern', 'code', 'recipe', 'delegation', 'pipeline'],                           tld: 'dcyfr.codes', destination: 'https://dcyfr.codes', description: 'Search code patterns' },
  { keywords: ['agent', 'bot', 'capability', 'manifest', 'marketplace', 'chat'],                             tld: 'dcyfr.bot',   destination: 'https://dcyfr.bot',   description: 'Browse agents' },
  { keywords: ['docker', 'kubernetes', 'k8s', 'infrastructure', 'ci', 'deploy', 'helm'],                     tld: 'dcyfr.build', destination: 'https://dcyfr.build', description: 'Browse infrastructure' },
  { keywords: ['cli', 'vscode', 'extension', 'profile', 'developer', 'tool', 'tutorial'],                    tld: 'dcyfr.work',  destination: 'https://dcyfr.work',  description: 'Explore dev tools' },
];

function routeSearch(query: string): SearchSuggestion[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return ROUTING_RULES
    .filter(({ keywords }) => keywords.some((kw) => q.includes(kw)))
    .map(({ tld, destination, description }) => ({
      label: query,
      description,
      destination: `${destination}?q=${encodeURIComponent(query)}`,
      tld,
    }))
    .slice(0, 4);
}

export function UnifiedSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    setSuggestions(routeSearch(q));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const first = suggestions[0];
    if (first) {
      window.open(first.destination, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} role="search" aria-label="Search DCYFR products">
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground pointer-events-none">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Search templates, agents, code patterns, infrastructure..."
            className={clsx(
              'w-full rounded-xl border border-input/60 bg-card/60',
              'pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground',
              'focus:border-secure/60 focus:outline-hidden focus:ring-1 focus:ring-secure/40',
              'text-sm'
            )}
            aria-label="Search across DCYFR products"
            aria-autocomplete="list"
            aria-controls={suggestions.length > 0 ? 'search-suggestions' : undefined}
          />
        </div>
      </form>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-input/60 bg-card shadow-xl"
        >
          {suggestions.map((s) => (
            <li key={s.destination} role="option" aria-selected={false}>
              <a
                href={s.destination}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/60 transition-colors"
                onClick={() => setSuggestions([])}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">&ldquo;{s.label}&rdquo;</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                <span className="text-xs font-mono text-accent shrink-0 ml-4">
                  {s.tld}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
