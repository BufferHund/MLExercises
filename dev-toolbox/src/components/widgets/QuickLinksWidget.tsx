import { Link2, ExternalLink } from 'lucide-react';

const links = [
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'ChatGPT', url: 'https://chat.openai.com' },
  { name: 'Google', url: 'https://google.com' },
];

export default function QuickLinksWidget() {
  return (
    <div className="glass rounded-xl p-4 shadow-glass h-40 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-medium text-white">快捷链接</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg transition-colors group"
          >
            <span className="text-xs text-slate-200">{link.name}</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}
