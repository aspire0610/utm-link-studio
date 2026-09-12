import React from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };

export default async function Home(props: { searchParams?: SearchParams }) {
  // 解析 Next.js 的 searchParams (相容新舊 Next.js 版本)
  const resolvedParams = props.searchParams ? await props.searchParams : {};
  
  const url = typeof resolvedParams.url === 'string' ? resolvedParams.url : '';
  const source = typeof resolvedParams.source === 'string' ? resolvedParams.source : '';
  const medium = typeof resolvedParams.medium === 'string' ? resolvedParams.medium : '';
  const campaign = typeof resolvedParams.campaign === 'string' ? resolvedParams.campaign : '';
  const term = typeof resolvedParams.term === 'string' ? resolvedParams.term : '';
  const content = typeof resolvedParams.content === 'string' ? resolvedParams.content : '';

  // 伺服器端即時拼接 UTM 網址
  let finalUrl = '';
  if (url.trim()) {
    let formattedBase = url.trim();
    if (!/^https?:\/\//i.test(formattedBase)) {
      formattedBase = 'https://' + formattedBase;
    }

    try {
      const parsedUrl = new URL(formattedBase);
      if (source.trim()) parsedUrl.searchParams.set('utm_source', source.trim());
      if (medium.trim()) parsedUrl.searchParams.set('utm_medium', medium.trim());
      if (campaign.trim()) parsedUrl.searchParams.set('utm_campaign', campaign.trim());
      if (term.trim()) parsedUrl.searchParams.set('utm_term', term.trim());
      if (content.trim()) parsedUrl.searchParams.set('utm_content', content.trim());
      finalUrl = parsedUrl.toString();
    } catch {
      finalUrl = formattedBase;
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* 科技感背景光暈 */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        
        {/* Header 標題區 */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            GA4 Standard Compatible
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400">
            UTM Link Studio
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            極簡、精準的行銷網址建構工具，打造乾淨無瑕的流量分析數據。
          </p>
        </div>

        {/* 快速範本導覽 (SSR 原生連結) */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl flex flex-wrap items-center gap-2 shadow-2xl">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5">
            ⚡ 快速範本:
          </span>
          <a
            href="?url=yahoo.com&source=facebook&medium=cpc&campaign=summer_sale"
            className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-300 transition-all duration-200"
          >
            FB 臉書廣告
          </a>
          <a
            href="?url=yahoo.com&source=instagram&medium=social&campaign=ig_bio"
            className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-300 transition-all duration-200"
          >
            IG Bio 連結
          </a>
          <a
            href="?url=yahoo.com&source=line&medium=oa&campaign=push_msg"
            className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-300 transition-all duration-200"
          >
            LINE 官方帳號
          </a>
          <a
            href="?url=yahoo.com&source=newsletter&medium=email&campaign=weekly_edm"
            className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-300 transition-all duration-200"
          >
            Email 電子報
          </a>
        </div>

        {/* 主表單卡片 (原生 GET 提交，綁定 key 保證同步狀態) */}
        <form action="/" method="GET" className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              目標網址 (Landing Page URL) <span className="text-cyan-400">*</span>
            </label>
            <input
              key={`url-${url}`}
              type="text"
              name="url"
              defaultValue={url}
              placeholder="yahoo.com 或 https://example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                流量來源 (utm_source)
              </label>
              <input
                key={`source-${source}`}
                type="text"
                name="source"
                defaultValue={source}
                placeholder="google, facebook"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                媒介類型 (utm_medium)
              </label>
              <input
                key={`medium-${medium}`}
                type="text"
                name="medium"
                defaultValue={medium}
                placeholder="cpc, post, email"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              活動名稱 (utm_campaign)
            </label>
            <input
              key={`campaign-${campaign}`}
              type="text"
              name="campaign"
              defaultValue={campaign}
              placeholder="2026_summer_sale"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                關鍵字 (utm_term) - 選填
              </label>
              <input
                key={`term-${term}`}
                type="text"
                name="term"
                defaultValue={term}
                placeholder="running+shoes"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                廣告內容 (utm_content) - 選填
              </label>
              <input
                key={`content-${content}`}
                type="text"
                name="content"
                defaultValue={content}
                placeholder="buy_now_btn"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              🚀 產生 UTM 網址
            </button>
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
            >
              清空欄位
            </a>
          </div>
        </form>

        {/* 即時結果區域 */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>✨</span> 生成結果 Preview
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-sm break-all text-cyan-200 min-h-[64px] flex items-center">
            {finalUrl ? (
              <span className="select-all">{finalUrl}</span>
            ) : (
              <span className="text-slate-600 text-xs font-sans">請在上方的欄位輸入資料並按下「產生 UTM 網址」...</span>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}