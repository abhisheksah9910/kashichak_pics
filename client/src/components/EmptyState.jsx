import { ImageOff } from 'lucide-react';

export default function EmptyState({ icon: Icon = ImageOff, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-terracotta-200 dark:border-terracotta-900/50 px-6 py-16 text-center">
      <Icon className="mb-4 h-10 w-10 text-terracotta-400" />
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-ink-950/60 dark:text-terracotta-50/60">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
