'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  // 單一生成狀態
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');

  // 產出與互動狀態
  const [finalUrl, setFinalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // 批量生成狀態
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [batchResults, setBatchResults] = useState<{ original: string; utm: string }[]>([]);

  // 即時計算單一 UTM 網址
  useEffect(() => {
    if (!url.trim()) {
      setFinalUrl('');
      setShortUrl('');
      return;
    }

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
      setFinalUrl(parsedUrl.toString());
      setShortUrl('');
    } catch {
      setFinalUrl(formattedBase);
    }
  }, [url, source, medium, campaign, term, content]);

  // 一鍵複製
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 免費短網址產生
  const handleShorten = async () => {
    if (!finalUrl) return;
    setIsShortening(true);
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(finalUrl)}`);
      if (res.ok) {
        const text = await res.text();
        setShortUrl(text);
      }
    } catch (e) {
      console.error('Shorten error', e);
    } finally {
      setIsShortening(false);
    }
  };

  // 利用原生 API 產生與下載 QR Code
  const qrApiUrl = finalUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shortUrl || finalUrl)}`
    : '';

  const downloadQRCode = async () => {
    if (!qrApiUrl) return;
    try {
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = 'UTM_QRCode.png';
      downloadLink.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrApiUrl, '_blank');
    }
  };

  // 原生 CSV 解析 (無需外掛套件)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const urlIdx = headers.findIndex(h => h.includes('url') || h.includes('網址'));
      const sourceIdx = headers.findIndex(h => h.includes('source') || h.includes('來源'));
      const mediumIdx = headers.findIndex(h => h.includes('medium') || h.includes('媒介'));
      const campaignIdx = headers.findIndex(h => h.includes('campaign') || h.includes('活動'));

      const results = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const baseUrl = urlIdx !== -1 ? cols[urlIdx] : cols[0];
        const s = sourceIdx !== -1 ? cols[sourceIdx] : '';
        const m = mediumIdx !== -1 ? cols[mediumIdx] : '';
        const c = campaignIdx !== -1 ? cols[campaignIdx] : '';

        if (!baseUrl) continue;

        let formattedBase = baseUrl;
        if (!/^https?:\/\//i.test(formattedBase)) {
          formattedBase = 'https://' + formattedBase;
        }

        try {
          const parsedUrl = new URL(formattedBase);
          if (s) parsedUrl.searchParams.set('utm_source', s);
          if (m) parsedUrl.searchParams.set('utm_medium', m);
          if (c) parsedUrl.searchParams.set('utm_campaign', c);
          results.push({ original: baseUrl, utm: parsedUrl.toString() });
        } catch {
          results.push({ original: baseUrl, utm: formattedBase });
        }
      }
      setBatchResults(results);
    };
    reader.readAsText(file);
  };

  // 原生 CSV 下載
  const downloadBatchCSV = () => {
    if (batchResults.length === 0) return;
    let csvContent = 'data:text/csv;charset=utf-8,Original URL,UTM URL\n';
    batchResults.forEach(row => {
      csvContent += `"${row.original}","${row.utm}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'utm_batch_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* 背景光暈 */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        
        {/* Header 標題區 */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            GA4 Pro Tools Suite
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400">
            UTM Link Studio
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            極簡、精準的行銷網址建構工具，支援短網址、QR Code 與批量生成。
          </p>
        </div>

        {/* Tab 切換器 */}
        <div className="flex justify-center">
          <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex gap-1">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'single'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ 單組網址生成
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'batch'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📁 批量 CSV 生成
            </button>
          </div>
        </div>

        {activeTab === 'single' ? (
          <>
            {/* 快速範本 */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl flex flex-wrap items-center gap-2 shadow-2xl">
              <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5">
                ⚡ 快速填入:
              </span>
              <button
                onClick={() => { setSource('facebook'); setMedium('cpc'); setCampaign('summer_sale'); }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-300 transition-all"
              >
                FB 臉書廣告
              </button>
              <button
                onClick={() => { setSource('instagram'); setMedium('social'); setCampaign('ig_bio'); }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-300 transition-all"
              >
                IG Bio 連結
              </button>
              <button
                onClick={() => { setSource('line'); setMedium('oa'); setCampaign('push_msg'); }}
                className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-slate-700/50 text-xs text-slate-300 hover:text-cyan-300 transition-all"
              >
                LINE 官方帳號
              </button>
            </div>

            {/* 單一生成表單 */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  目標網址 (Landing Page URL) <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yahoo.com 或 https://example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    流量來源 (utm_source)
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="google, facebook"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    媒介類型 (utm_medium)
                  </label>
                  <input
                    type="text"
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
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
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="2026_summer_sale"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">關鍵字 (utm_term)</label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="running+shoes"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">廣告內容 (utm_content)</label>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="buy_now_btn"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setUrl(''); setSource(''); setMedium(''); setCampaign(''); setTerm(''); setContent(''); }}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                >
                  清空所有欄位
                </button>
              </div>
            </div>

            {/* 即時結果 Preview 卡片 */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  ✨ 生成結果 Preview
                </span>
                {finalUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShorten}
                      disabled={isShortening}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isShortening ? '處理中...' : shortUrl ? '重新縮短' : '🔗 一鍵縮短網址'}
                    </button>
                    <button
                      onClick={() => setShowQr(!showQr)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      📷 {showQr ? '隱藏 QR Code' : '顯示 QR Code'}
                    </button>
                  </div>
                )}
              </div>

              {/* 網址顯示區 */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-sm break-all text-cyan-200 min-h-[64px] flex items-center justify-between gap-4">
                {finalUrl ? (
                  <>
                    <span>{shortUrl || finalUrl}</span>
                    <button
                      onClick={() => handleCopy(shortUrl || finalUrl)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all flex items-center gap-1 text-xs font-sans cursor-pointer"
                    >
                      {copied ? '✅ 已複製' : '📋 複製'}
                    </button>
                  </>
                ) : (
                  <span className="text-slate-600 text-xs font-sans">請在上方的欄位輸入資料...</span>
                )}
              </div>

              {/* QR Code 展開區 */}
              {showQr && finalUrl && (
                <div className="pt-4 border-t border-slate-800 flex flex-col items-center gap-3">
                  <div className="p-3 bg-white rounded-2xl shadow-xl">
                    <img src={qrApiUrl} alt="UTM QR Code" className="w-44 h-44" />
                  </div>
                  <button
                    onClick={downloadQRCode}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
                  >
                    ⬇️ 下載 QR Code (PNG)
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* 批量生成模式 */
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="border-2 border-dashed border-slate-700/80 rounded-2xl p-8 text-center space-y-4 hover:border-cyan-500/50 transition-all">
              <div className="text-3xl">📁</div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">上傳 CSV 檔案進行批量生成</h3>
                <p className="text-xs text-slate-400 mt-1">
                  請確定 CSV 包含欄位：<code className="text-cyan-300">url</code>, <code className="text-cyan-300">source</code>, <code className="text-cyan-300">medium</code>, <code className="text-cyan-300">campaign</code>
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-all"
              >
                選擇 CSV 檔案
              </label>
            </div>

            {batchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">
                    成功處理 {batchResults.length} 組連結
                  </span>
                  <button
                    onClick={downloadBatchCSV}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    ⬇️ 下載批量生成 CSV
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {batchResults.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono break-all text-cyan-300">
                      {item.utm}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
