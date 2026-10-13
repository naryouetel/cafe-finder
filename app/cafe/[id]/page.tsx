// app/cafe/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ----------------------------------------------------
// カスタムSVGアイコン
// ----------------------------------------------------
function WifiIcon() {
  return (
    <svg className="w-4 h-4 text-stone-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  )
}

function PowerIcon() {
  return (
    <svg className="w-4 h-4 text-stone-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function VolumeIcon() {
  return (
    <svg className="w-4 h-4 text-stone-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )
}

function DeskIcon() {
  return (
    <svg className="w-4 h-4 text-stone-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

export default function CafeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cafeId = params.id as string

  const [cafe, setCafe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  // カフェ詳細データの取得
  useEffect(() => {
    async function fetchCafeDetail() {
      if (!cafeId) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('cafes')
          .select('*, cafe_work_scores(*)')
          .eq('id', cafeId)
          .single()

        if (error) throw error
        setCafe(data)
      } catch (err) {
        console.error('データ取得エラー:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCafeDetail()
  }, [cafeId])

  // localStorage からお気に入り状態を初期化
  useEffect(() => {
    if (!cafeId) return
    try {
      const storedFavorites = JSON.parse(localStorage.getItem('cafe_favorites') || '[]')
      setIsFavorite(storedFavorites.includes(cafeId))
    } catch (err) {
      console.error('お気に入り状態の取得に失敗しました:', err)
    }
  }, [cafeId])

  // お気に入りのトグル処理
  const toggleFavorite = () => {
    if (!cafeId) return
    try {
      const storedFavorites: string[] = JSON.parse(
        localStorage.getItem('cafe_favorites') || '[]'
      )
      let updatedFavorites: string[]

      if (isFavorite) {
        updatedFavorites = storedFavorites.filter((id) => id !== cafeId)
      } else {
        updatedFavorites = [...storedFavorites, cafeId]
      }

      localStorage.setItem('cafe_favorites', JSON.stringify(updatedFavorites))
      setIsFavorite(!isFavorite)
    } catch (err) {
      console.error('お気に入りの保存に失敗しました:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e5dcd0] via-[#f7f4ef] to-[#ebd2] flex items-center justify-center font-serif text-stone-500 text-xs">
        カフェ情報を読み込み中...
      </div>
    )
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e5dcd0] via-[#f7f4ef] to-[#ebd2] p-6 text-center flex flex-col items-center justify-center font-serif text-stone-700">
        <p className="text-xs mb-4">カフェ情報が見つかりませんでした。</p>
        <Link href="/" className="text-xs text-stone-900 underline tracking-wide">
          トップページに戻る
        </Link>
      </div>
    )
  }

  const scoreData = Array.isArray(cafe.cafe_work_scores)
    ? cafe.cafe_work_scores[0]
    : cafe.cafe_work_scores

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#e5dcd0] via-[#f7f4ef] to-[#ebd2] font-sans text-stone-800 antialiased">
      {/* メインコンテンツエリア */}
      <main className="flex-1 p-5 max-w-md mx-auto w-full pb-14">
        
        {/* 1. トップページへ戻る矢印ボタン */}
        <div className="flex items-center justify-between mb-5 mt-1">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-xs font-serif text-stone-700 hover:text-stone-950 transition-colors py-1 pr-3"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="tracking-wider">トップへ戻る</span>
          </button>
        </div>

        {/* 2. 画像エリア ＆ お気に入りボタン */}
        <div className="relative w-full h-56 bg-stone-200/80 rounded-xl overflow-hidden shadow-sm border border-stone-200/90 mb-6 flex items-center justify-center">
          {cafe.image_url ? (
            <img
              src={cafe.image_url}
              alt={cafe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-serif text-stone-400 text-xs tracking-widest">
              PHOTO
            </span>
          )}

          {/* 右上お気に入り（ハート）ボタン */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm border border-stone-200/60 active:scale-90 transition-all duration-200 cursor-pointer"
            aria-label="お気に入り"
          >
            <svg
              className={`w-4 h-4 transition-colors duration-300 ${
                isFavorite
                  ? 'text-rose-700 fill-rose-700'
                  : 'text-stone-600 fill-transparent'
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={isFavorite ? 0 : 1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        {/* 3. カフェタイトル ＆ サブタイトル（サブエリア等） */}
        <div className="mb-6 px-1">
          <h1 className="font-serif text-xl font-normal text-stone-900 mb-2 tracking-wide leading-snug">
            {cafe.name}
          </h1>
          <p className="font-serif text-xs text-stone-600 tracking-wider">
            {cafe.subtitle || `${cafe.area} / ワークスペース`}
          </p>
        </div>

        {/* 4. 作業スコアカード */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 border border-stone-200/90 shadow-sm mb-6 space-y-4">
          <h2 className="font-serif text-xs font-normal text-stone-900 border-b border-stone-100 pb-2.5 tracking-wider">
            作業スコア
          </h2>

          <div className="space-y-3 font-serif text-xs text-stone-700">
            {/* Wi-Fi */}
            <div className="flex items-center gap-2.5">
              <WifiIcon />
              <div>
                <span>Wi-Fi : </span>
                <span className="font-sans font-medium text-stone-900">
                  {scoreData?.wifi_detail || 'データなし'}
                </span>
              </div>
            </div>

            {/* 電源 */}
            <div className="flex items-center gap-2.5">
              <PowerIcon />
              <div>
                <span>電源 : </span>
                <span>{scoreData?.power_detail || 'データなし'}</span>
              </div>
            </div>

            {/* 静かさ */}
            <div className="flex items-center gap-2.5">
              <VolumeIcon />
              <div>
                <span>静かさ : </span>
                <span>{scoreData?.noise_detail || 'データなし'}</span>
              </div>
            </div>

            {/* 机の広さ */}
            <div className="flex items-center gap-2.5">
              <DeskIcon />
              <div>
                <span>机の広さ : </span>
                <span>{scoreData?.desk_detail || 'データなし'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. キャッチコピー */}
        {cafe.catchphrase && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-stone-200/80 mb-6 font-serif text-xs text-stone-700 leading-relaxed italic">
            「{cafe.catchphrase}」
          </div>
        )}

        {/* 6. ハッシュタグ一覧 */}
        {cafe.tags && cafe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 px-1">
            {cafe.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="text-[11px] font-serif text-stone-600 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-stone-200/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </main>

      {/* 7. フッター */}
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