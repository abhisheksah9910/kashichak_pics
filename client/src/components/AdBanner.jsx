import { Megaphone } from 'lucide-react';

export default function AdBanner({ type = "horizontal", slotId = "" }) {
  // This is a placeholder component for Google AdSense or Local Ads.
  // In the future, you will replace this with:
  // <ins className="adsbygoogle"
  //      style={{ display: "block" }}
  //      data-ad-client="ca-pub-XXXXXXXXXXXXX"
  //      data-ad-slot={slotId}
  //      data-ad-format="auto"
  //      data-full-width-responsive="true"></ins>

  return (
    <div className={`w-full bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-sm ${type === 'square' ? 'aspect-square max-w-xs mx-auto' : 'h-32'}`}>
      <div className="flex items-center justify-center gap-2 text-terracotta-500 mb-2">
        <Megaphone className="h-5 w-5" />
        <span className="text-sm font-bold uppercase tracking-widest">Advertisement</span>
      </div>
      <p className="text-xs text-ink-950/50 dark:text-terracotta-50/50 max-w-xs">
        Support our community by viewing this ad. 
        <br />
        <span className="opacity-50">(AdSense Placeholder - {type})</span>
      </p>
    </div>
  );
}
