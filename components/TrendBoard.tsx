import React from 'react';
import { Flame, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

export const TrendBoard: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 max-w-5xl mx-auto">
      
      {/* Official Data Sources Section */}
      <section>
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-indigo-600" />
                热点情报站
            </h2>
            <p className="text-gray-500 mt-1">实时追踪全网趋势，捕捉第一手爆款灵感</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kaola Hot */}
            <a 
                href="https://www.kaolamedia.com/hot" 
                target="_blank" 
                rel="noreferrer"
                className="group bg-white border border-orange-100 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-orange-300 transition-all flex items-center justify-between overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-40 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 text-white transform group-hover:rotate-6 transition-transform">
                        <Flame className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">考拉新媒体 · 热点榜</h3>
                        <p className="text-sm text-gray-500 mt-1">深度聚合抖音、小红书等全平台实时榜单</p>
                    </div>
                </div>
                <ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </a>

            {/* Kaola Calendar */}
            <a 
                href="https://www.kaolamedia.com/calendar" 
                target="_blank" 
                rel="noreferrer"
                className="group bg-white border border-blue-100 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex items-center justify-between overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-40 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 text-white transform group-hover:-rotate-6 transition-transform">
                        <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">营销日历</h3>
                        <p className="text-sm text-gray-500 mt-1">关键节点、节日活动提醒，提前布局爆款</p>
                    </div>
                </div>
                <ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </a>
        </div>
      </section>

      {/* Quick Guide Card */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="max-w-2xl">
              <h3 className="text-xl font-bold mb-4">创作贴士：如何高效利用热点？</h3>
              <ul className="space-y-3 opacity-90">
                  <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs mt-0.5">1</div>
                      <p className="text-sm">通过考拉榜单寻找与你领域相关的 <b>热点词/BGM/话题</b>。</p>
                  </li>
                  <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs mt-0.5">2</div>
                      <p className="text-sm">保存热点视频，使用 <b>内容拆解器</b> 提取其爆款逻辑和文案结构。</p>
                  </li>
                  <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs mt-0.5">3</div>
                      <p className="text-sm">利用 AI 结合你的产品特性，<b>快速改写</b> 为符合你品牌风格的新笔记。</p>
                  </li>
              </ul>
          </div>
      </section>

    </div>
  );
};