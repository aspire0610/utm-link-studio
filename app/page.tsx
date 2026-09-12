'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Papa from 'papaparse';
import { 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  Link as LinkIcon, 
  Upload, 
  Sparkles, 
  RefreshCw,
  Zap
} from 'lucide-react';

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
      setShortUrl(''); // 網址改變時重置短網址
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

  // 免費短網址產生 (使用 TinyURL API)
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

  // 下載 QR Code PNG
  const downloadQRCode = () => {
    const svgElement = document.getElementById('utm-qrcode');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 10, 10, 280, 280);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `UTM_QRCode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // 處理 CSV 檔案上傳批量生成
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        const generated = rows.map((row) => {
          const baseUrl = row.url || row.URL || row['目標網址'] || '';
          const s = row.source || row.utm_source || row['流量來源'] || '';
          const m = row.medium || row.utm_medium || row['媒介類型'] || '';
          const c = row.campaign || row.utm_campaign || row['活動名稱'] || '';

          if (!baseUrl) return { original: '', utm: '' };

          let formattedBase = baseUrl.trim();
          if (!/^https?:\/\//i.test(formattedBase)) {
            formattedBase = 'https://' + formattedBase;
          }

          try {
            const parsedUrl = new URL(formattedBase);
            if (s) parsedUrl.searchParams.set('utm_source', s.trim());
            if (m) parsedUrl.searchParams.set('utm_medium', m.trim());
            if (c) parsedUrl.searchParams.set('utm_campaign', c.trim());
            return { original: baseUrl, utm: parsedUrl.toString() };
          } catch {
            return { original: baseUrl, utm: formattedBase };
          }
        }).filter(item => item.utm);

        setBatchResults(generated);
      }
    });
  };

  // 下載批量生成結果 CSV
  const downloadBatchCSV = () => {
    if (batchResults.length === 0) return;
    const csv = Papa.unparse(batchResults);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'utm_batch_results.csv';
    link.click();
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

        {/* Tab 切換器：單一模式 vs 批量模式 */}
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
              <Zap className="w-3.5 h-3.5" /> 單組網址生成
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'batch'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> 批量 CSV 生成
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
                  <Sparkles className="w-4 h-4" /> 生成結果 Preview
                </span>
                {finalUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShorten}
                      disabled={isShortening}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      {isShortening ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />}
                      {shortUrl ? '重新縮短' : '一鍵縮短網址'}
                    </button>
                    <button
                      onClick={() => setShowQr(!showQr)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                      {showQr ? '隱藏 QR Code' : '顯示 QR Code'}
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
                      className="shrink-0 p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all flex items-center gap-1 text-xs font-sans"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? '已複製' : '複製'}
                    </button>
                  </>
                ) : (
                  <span className="text-slate-600 text-xs font-sans">請在上方的欄位輸入資料...</span>
                )}
              </div>

              {/* QR Code 展開區 */}
              {showQr && finalUrl && (
                <div className="pt-4 border-t border-slate-800 flex flex-col items-center gap-3">
                  <div className="p-4 bg-white rounded-2xl shadow-xl">
                    <QRCodeSVG id="utm-qrcode" value={shortUrl || finalUrl} size={180} />
                  </div>
                  <button
                    onClick={downloadQRCode}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all"
                  >
                    <Download className="w-4 h-4" /> 下載高解析度 QR Code (PNG)
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* 批量生成模式 */
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="border-2 border-dashed border-slate-700/80 rounded-2xl p-8 text-center space-y-4 hover:border-cyan-500/50 transition-all">
              <Upload className="w-10 h-10 text-cyan-400 mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-slate-200">上傳 CSV 檔案進行批量生成</h3>
                <p className="text-xs text-slate-400 mt-1">
                  請確定 CSV 包含標頭：<code className="text-cyan-300">url</code>, <code className="text-cyan-300">source</code>, <code className="text-cyan-300">medium</code>, <code className="text-cyan-300">campaign</code>
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
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" /> 下載批量生成 CSV
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