import { useState, useEffect } from 'react';
import { LogIn, LogOut, Crown, Layout, Grid } from 'lucide-react';
import { tools, toolCategories } from '../config/tools';
import { useUserStore } from '../stores/useUserStore';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import ToolWidget from './ToolWidget';
import ToolDetail from './ToolDetail';
import LoginModal from './LoginModal';
import AISearch from './AISearch';
import WidgetContainer from './WidgetContainer';
import WidgetManager from './WidgetManager';
import AllToolsModal from './AllToolsModal';
import type { ToolId, ToolCategory } from '../types/tools';

export default function DevToolbox() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showWidgetManager, setShowWidgetManager] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const { isLoggedIn, isPremium, email, logout } = useUserStore();
  const { savePosition } = useScrollRestoration('dev-toolbox-main');

  // 检测是否首次加载
  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('hasLoadedOnce');
    if (hasLoaded) {
      setIsFirstLoad(false);
    } else {
      sessionStorage.setItem('hasLoadedOnce', 'true');
    }
  }, []);

  const handleToolClick = (toolId: ToolId, requiresPremium: boolean) => {
    if (requiresPremium && !isPremium) {
      setShowLogin(true);
      return;
    }
    // 保存当前滚动位置
    savePosition();
    setActiveTool(toolId);
  };

  if (activeTool) {
    return <ToolDetail toolId={activeTool} onClose={() => setActiveTool(null)} />;
  }

  // 主页只显示AI和图片工具
  const homeCategories: ToolCategory[] = ['ai', 'image'];
  const homeCategoryGroups = homeCategories.map(cat => ({
    category: cat,
    config: toolCategories[cat],
    tools: tools.filter(t => t.category === cat)
  })).filter(group => group.tools.length > 0);

  // Debug: Log tool counts
  console.log('=== Dev Toolbox Debug ===');
  console.log('Total tools:', tools.length);
  console.log('Home categories:', homeCategoryGroups.length);
  homeCategoryGroups.forEach(group => {
    console.log(`${group.config.name}: ${group.tools.length} tools`);
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">开发者工具箱 v2.0</h1>
            <p className="text-slate-400">简洁实用的开发工具集合 - 76个工具7大分类</p>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllTools(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white transition-colors shadow-lg"
              title="查看全部工具"
            >
              <Grid className="w-4 h-4" />
              <span>全部工具</span>
            </button>
            <button
              onClick={() => setShowWidgetManager(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 transition-colors"
              title="管理卡片"
            >
              <Layout className="w-4 h-4" />
              <span className="hidden md:inline">卡片</span>
            </button>
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
                  {isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
                  <span className="text-sm text-slate-300">{email}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors"
              >
                <LogIn className="w-4 h-4" />
                登录
              </button>
            )}
          </div>
        </div>

        {/* AI Search Bar */}
        <AISearch />

        {/* Widgets */}
        <WidgetContainer />

        {/* Tool Categories - 只显示AI和图片工具 */}
        <div className="space-y-12">
          {homeCategoryGroups.map((group, idx) => (
            <section
              key={group.category}
              className={isFirstLoad ? "animate-slide-up" : ""}
              style={isFirstLoad ? { animationDelay: `${idx * 100}ms` } : {}}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br ${group.config.color} rounded-2xl flex items-center justify-center`}>
                  <group.config.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">{group.config.name}</h2>
                <span className="text-sm text-slate-500">({group.tools.length})</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {group.tools.map((tool, toolIdx) => (
                  <ToolWidget
                    key={tool.id}
                    tool={tool}
                    onClick={() => handleToolClick(tool.id, tool.isPremium || false)}
                    delay={isFirstLoad ? toolIdx * 50 : 0}
                    showPremiumBadge={tool.isPremium}
                    isLocked={tool.isPremium && !isPremium}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Widget Manager */}
      {showWidgetManager && <WidgetManager onClose={() => setShowWidgetManager(false)} />}

      {/* All Tools Modal */}
      {showAllTools && (
        <AllToolsModal
          onClose={() => setShowAllTools(false)}
          onToolClick={(toolId, isPremium) => {
            setShowAllTools(false);
            handleToolClick(toolId, isPremium);
          }}
        />
      )}
    </div>
  );
}
