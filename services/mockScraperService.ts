import { TrendItem, Platform } from '../types';

// 由于浏览器无法直接跨域抓取 kaolamedia.com，这里保留模拟数据结构，
// 但我们将链接改为真实的搜索引擎链接，确保用户点击后能看到真实的相关内容。
export const fetchMockTrends = async (): Promise<TrendItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const generateSearchUrl = (keyword: string) => `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`;

  return [
    {
      id: '1',
      rank: 1,
      title: '2024夏季多巴胺穿搭趋势',
      hotScore: 982300,
      platform: Platform.XIAOHONGSHU,
      summary: '色彩鲜艳的穿搭风格再次回潮，小红书相关笔记搜索量暴增300%。',
      searchUrl: generateSearchUrl('小红书 多巴胺穿搭')
    },
    {
      id: '2',
      rank: 2,
      title: '上海City Walk路线打卡',
      hotScore: 871000,
      platform: Platform.XIAOHONGSHU,
      summary: '武康路、安福路等经典路线持续火热，出现大量探店视频。',
      searchUrl: generateSearchUrl('上海 City Walk 路线')
    },
    {
      id: '3',
      rank: 3,
      title: '家庭自制冰美式教程',
      hotScore: 765400,
      platform: Platform.DOUYIN,
      summary: '低成本、高颜值的家庭咖啡制作视频在抖音爆火。',
      searchUrl: generateSearchUrl('抖音 家庭版冰美式')
    },
    {
      id: '4',
      rank: 4,
      title: 'AI工具提升职场效率',
      hotScore: 650000,
      platform: Platform.VIDEO_ACCOUNT,
      summary: '视频号职场博主集中推广各类生成式AI工具的使用技巧。',
      searchUrl: generateSearchUrl('视频号 AI工具 效率')
    },
    {
      id: '5',
      rank: 5,
      title: '萌宠搞笑反应合集',
      hotScore: 540000,
      platform: Platform.DOUYIN,
      summary: '经典的猫狗搞笑视频，配合热门BGM卡点剪辑。',
      searchUrl: generateSearchUrl('抖音 萌宠 搞笑')
    }
  ];
};
