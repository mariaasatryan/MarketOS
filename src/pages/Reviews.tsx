import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Star, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Reviews() {
  const { t } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [reply, setReply] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const sendReply = async (id: string) => {
    const text = (reply[id] || '').trim();
    if (!text) return;
    const { error } = await supabase.from('reviews').update({ response: text }).eq('id', id);
    if (error) return alert(error.message);
    setReply((s) => ({ ...s, [id]: '' }));
    load();
  };

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">{t('reviews.title')}</h1>
      {items.map((r) => (
        <div key={r.id} className="border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-medium">{r.author}</div>
            <div className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: r.rating || 0 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <div className="text-xs text-slate-500 ml-auto">{new Date(r.created_at).toLocaleString()}</div>
          </div>
          <div className="text-slate-800 mb-3">{r.text}</div>
          <div className="space-y-2">
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
              placeholder={t('reviews.enterReply')}
              value={reply[r.id] || ''}
              onChange={(e) => setReply((s) => ({ ...s, [r.id]: e.target.value }))}
            />
            <button className="w-full bg-red-600 text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2"
              onClick={() => sendReply(r.id)}
            >
              <Send size={16} /> {t('reviews.send')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}