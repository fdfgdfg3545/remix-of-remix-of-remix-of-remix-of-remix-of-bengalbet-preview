// @ts-nocheck
import React from 'react';
import { X, Youtube, ExternalLink } from 'lucide-react';
import { YOUTUBE_VIDEO_MONEY_COMING } from './moneyComingTypes';
import { Language } from '../../types';

interface VideoModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
}

export const MoneyComingVideoModal: React.FC<VideoModalProps> = ({ isOpen, language, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#180d00] border-2 border-yellow-500/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-[#241300] border-b border-yellow-500/40">
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm text-yellow-300">
              {language === 'bn' ? 'মানি কামিং কৌশল ও গেমপ্লে ভিডিও' : 'Money Coming Gameplay & Win Strategy Video'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-video w-full bg-black">
          <iframe
            className="w-full h-full"
            src={YOUTUBE_VIDEO_MONEY_COMING.embedUrl}
            title={YOUTUBE_VIDEO_MONEY_COMING.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-3 bg-[#180d00] flex items-center justify-between text-xs text-yellow-200/80">
          <span>{YOUTUBE_VIDEO_MONEY_COMING.title}</span>
          <a
            href={YOUTUBE_VIDEO_MONEY_COMING.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-yellow-400 hover:underline"
          >
            <span>YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
