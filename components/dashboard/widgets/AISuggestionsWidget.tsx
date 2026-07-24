'use client';

import { Sparkles, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AISuggestionsWidget() {
  const suggestions = [
    {
      title: 'Hydration Target',
      text: 'Based on your recent vitals, aim for 2.5L of water intake today.',
    },
    {
      title: 'Sleep Routine',
      text: 'Consistent 7-8 hours of sleep improves heart rate variability.',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
      {/* Decorative Sparkle Background */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="w-32 h-32 text-white" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-blue-300" />
        </span>
        <h3 className="text-sm font-bold tracking-wide uppercase text-blue-200">AI Health Insights</h3>
      </div>

      <div className="space-y-3 relative z-10">
        {suggestions.map((item, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <p className="text-xs font-bold text-blue-100">{item.title}</p>
            <p className="text-xs text-blue-200/90 mt-0.5 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
        <span className="inline-flex items-center gap-1 text-[10px] text-blue-300">
          <Info className="w-3 h-3" />
          Non-diagnostic assistant
        </span>
        <Link
          href="/dashboard"
          className="font-semibold text-white hover:text-blue-300 flex items-center gap-1 text-xs"
        >
          Ask Assistant <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
