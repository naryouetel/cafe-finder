// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// フィルターの型定義
type FilterType = 'wifi' | 'quiet' | 'meeting' | 'power'

interface FilterOption {
  id: FilterType
  label: string
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'wifi', label: 'Wi-Fi高速' },
  { id: 'quiet', label: '静かさ重視' },
  { id: 'meeting', label: 'Web会議可' },
  { id: 'power', label: '電源あり' },
]

// 各カフェの正確なワイヤーフレームスコア定義
const CAFE_EXACT_SCORES: Record<string, { focus: number; meeting: number; quick: number }> = {
  'Little Darling COFFEE ROASTERS': { focus: 1, meeting: 1, quick: 2 },
  'CONNEL COFFEE': { focus: 2, meeting: 1, quick: 3 },
  'HAKADORU': { focus: 3, meeting: 3, quick: 2 },
  'Coffice': { focus: 3, meeting: 2, quick: 3 },
  'Caffice': { focus: 3, meeting: 2, quick: 3 },
}

// インラインSVGで描画するオリジナル・コーヒーカップアイコン
function CoffeeIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-colors duration-300 ${
        active ? 'text-amber-800' : 'text-stone-300/80'
      }`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M2 19c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8H2v11zM4 10h12v9H4v-9zm16-5h-2V3c0-.55-.45-1-1-1s-1 .45-1 1v2H6V3c0-.55-.45-1-1-1s-1 .45-1 1v2H2c-.55 0-1 .45-1 1s.45 1 1 1h18c1.1 0 2-.9 2-2s-.9-2-2-2zm0 3h-2v2h2c.55 0 1-.45 1-1s-.45-1-1-1z" />
    </svg>
  )
}

// 3軸インジケータ（コーヒーカップマーク 3段階評価）
function ScoreIndicator({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-stone-700 font-serif font-normal">
      <span className="tracking-wider">{label}</span>
      <div className="flex gap-1 items-center">
        {[1, 2, 3].map((i) => (
          <CoffeeIcon key={i} active={i <= (score || 0)} />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [cafes, setCafes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // フィルター状態・検索状態
  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Supabaseからデータ取得
  useEffect(() => {
    async function fetchCafes() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('cafes')
          .select('*, cafe_work_scores(*)')
          .order('created_at', { ascending: true })

        if (error) throw error
        setCafes(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCafes()
  }, [])

  // フィルターのトグル処理
  const toggleFilter = (filterId: FilterType) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    )
  }

  // 絞り込みロジック (AND検索)
  const filteredCafes = cafes.filter((cafe) => {
    const dbScore = Array.isArray(cafe.cafe_work_scores)
      ? cafe.cafe_work_scores[0]
      : cafe.cafe_work_scores

    const exactScore = CAFE_EXACT_SCORES[cafe.name]
    const scoreFocus = exactScore?.focus ?? dbScore?.score_focus ?? 1
    const scoreMeeting = exactScore?.meeting ?? dbScore?.score_meeting ?? 1
    const scoreQuick = exactScore?.quick ?? dbScore?.score_quick ?? 1

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchName = cafe.name?.toLowerCase().includes(query)
      const matchArea = cafe.area?.toLowerCase().includes(query)
      if (!matchName && !matchArea) return false
    }

    for (const filter of selectedFilters) {
      if (filter === 'wifi' && scoreFocus < 2) return false
      if (filter === 'quiet' && scoreFocus < 2) return false
      if (filter === 'meeting' && scoreMeeting < 2) return false
      if (filter === 'power' && scoreQuick < 2) return false
    }

    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#e5dcd0] via-[#f7f4ef] to-[#ebd2] font-sans text-stone-800 antialiased">
      {/* CSSカスタムアニメーション */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* メインコンテンツエリア */}
      <main className="flex-1 p-5 max-w-md mx-auto w-full">
        {/* 1. ヘッダー */}
        <header className="mt-3 mb-7">
          <h1 className="text-2xl font-serif text-stone-900 italic tracking-wider font-normal">
            Cafe Finder
          </h1>
        </header>

        {/* 2. 検索窓 */}
        <div className="mb-7">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="カフェ名・エリア名で検索"
            className="w-full px-4 py-3 text-xs font-serif bg-white/90 backdrop-blur-md border border-stone-300/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-700 text-stone-800 placeholder-stone-400/90 shadow-sm transition-all"
          />
        </div>

        {/* 3. カプセルボタン */}
        <div className="mb-9">
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {FILTER_OPTIONS.map((filter) => {
              const isSelected = selectedFilters.includes(filter.id)
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-xs font-serif font-normal whitespace-nowrap transition-all duration-200 shadow-sm active:scale-95 tracking-wide ${
                    isSelected
                      ? 'bg-stone-800 text-stone-100 border border-stone-800'
                      : 'bg-white/80 backdrop-blur-md border border-stone-300/80 text-stone-600 hover:bg-white hover:text-stone-900'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          {/* 絞り込み件数のガイド表示 */}
          {selectedFilters.length > 0 && (
            <div className="mt-2.5 text-[11px] font-serif text-stone-600 px-1 flex items-center justify-between animate-fade-in-up">
              <span>
                該当店舗: <strong className="font-normal">{filteredCafes.length}</strong> 件
              </span>
              <button
                onClick={() => setSelectedFilters([])}
                className="text-stone-500 underline hover:text-stone-800"
              >
                リセット
              </button>
            </div>
          )}
        </div>

        {/* 4. カフェカード一覧 */}
        {loading ? (
          <div className="py-20 text-center font-serif text-stone-500 text-xs">
            カフェ情報を読み込み中...
          </div>
        ) : error ? (
          <div className="py-10 text-center font-serif text-red-500 text-xs">
            エラーが発生しました: {error}
          </div>
        ) : filteredCafes.length === 0 ? (
          <div className="py-16 text-center text-stone-600 bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/80 p-6 animate-fade-in-up">
            <p className="font-serif text-sm text-stone-800 mb-1">
              該当するカフェが見つかりません
            </p>
            <p className="text-xs font-serif text-stone-500">
              条件を変更してお試しください。
            </p>
          </div>
        ) : (
          <div className="space-y-7 mb-14">
            {filteredCafes.map((cafe, index) => {
              const dbScore = Array.isArray(cafe.cafe_work_scores)
                ? cafe.cafe_work_scores[0]
                : cafe.cafe_work_scores

              const exactScore = CAFE_EXACT_SCORES[cafe.name]
              const scoreFocus = exactScore?.focus ?? dbScore?.score_focus ?? 1
              const scoreMeeting = exactScore?.meeting ?? dbScore?.score_meeting ?? 1
              const scoreQuick = exactScore?.quick ?? dbScore?.score_quick ?? 1

              return (
                <Link
                  key={cafe.id}
                  href={`/cafe/${cafe.id}`}
                  className="block no-underline"
                >
                  <div
                    style={{ animationDelay: `${index * 0.07}s` }}
                    className="animate-fade-in-up bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-stone-200/90 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  >
                    {/* 画像表示エリア（image_urlの有無で自動分岐） */}
                    <div className="w-full h-44 bg-stone-200/80 flex items-center justify-center overflow-hidden">
                      {cafe.image_url ? (
                        <img
                          src={cafe.image_url}
                          alt={cafe.name}
                          className="w-full h-full object-top"
                        />
                      ) : (
                        <span className="text-stone-400 font-serif text-xs tracking-widest">
                          PHOTO
                        </span>
                      )}
                    </div>

                    {/* カフェ詳細 */}
                    <div className="p-4.5">
                      <h2 className="font-serif text-base font-normal text-stone-900 mb-1.5 tracking-wide">
                        {cafe.name}
                      </h2>

                      <div className="mb-4">
                        <span className="inline-block bg-stone-100/90 text-stone-600 text-[11px] font-serif px-2.5 py-0.5 rounded border border-stone-200/70 tracking-wider">
                          {cafe.area}
                        </span>
                      </div>

                      {/* 3段階スコア表示 */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-3 border-t border-stone-100">
                        <ScoreIndicator
                          label="じっくり作業"
                          score={scoreFocus}
                        />
                        <ScoreIndicator
                          label="Web会議"
                          score={scoreMeeting}
                        />
                        <ScoreIndicator
                          label="サクッと作業"
                          score={scoreQuick}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* 5. フッター */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-10 px-4 border-t border-stone-800">
        <div className="max-w-md mx-auto text-center space-y-4">
          <h2 className="text-xl font-serif italic text-stone-200 font-normal tracking-wide">
            Cafe Finder
          </h2>
          <p className="text-xs font-serif text-stone-400 leading-relaxed max-w-xs mx-auto">
            ノマド・リモートワーカーのための、最適な作業環境が見つかるカフェ検索ガイド。
          </p>

          <div className="flex justify-center gap-4 text-xs font-serif text-stone-400 pt-2">
            <a href="#" className="hover:text-stone-200 transition">利用規約</a>
            <span>•</span>
            <a href="#" className="hover:text-stone-200 transition">プライバシー</a>
            <span>•</span>
            <a href="#" className="hover:text-stone-200 transition">お問い合わせ</a>
          </div>

          <div className="pt-4 border-t border-stone-800/80 text-[11px] text-stone-500 font-serif">
            © 2026 Cafe Finder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}