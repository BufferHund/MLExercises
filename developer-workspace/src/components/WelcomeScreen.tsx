import { BookOpen, Sparkles } from 'lucide-react';

export default function WelcomeScreen() {
  return (
    <div className="text-center mb-14">
      <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-primary via-secondary to-accent-purple rounded-4xl mb-8 animate-float shadow-glass animate-glow">
        <BookOpen className="w-14 h-14 text-white" strokeWidth={2.5} />
      </div>
      <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent-purple bg-clip-text text-transparent mb-4 tracking-tight">
        Moobi Reader
      </h1>
      <p className="text-white/80 text-xl font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-accent-yellow animate-pulse-soft" />
        现代化电子书阅读体验
        <Sparkles className="w-5 h-5 text-accent-yellow animate-pulse-soft" />
      </p>
    </div>
  );
}
