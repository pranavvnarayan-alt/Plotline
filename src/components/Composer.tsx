/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, MicOff, X, AlertCircle, Loader2 } from 'lucide-react';

interface ComposerProps {
  onSendMessage: (text: string, image?: { mimeType: string; base64Data: string; previewUrl: string }) => void;
  isLoading: boolean;
  onCancelRequest?: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  isLoading,
  onCancelRequest,
}) => {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{
    mimeType: string;
    base64Data: string;
    previewUrl: string;
    fileName: string;
  } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const initialTextRef = useRef<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Unsupported format. Please select a JPEG, PNG, or WebP image.');
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      setImageError('Image exceeds the 5MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.split(',')[1];
      setAttachedImage({
        mimeType: file.type,
        base64Data,
        previewUrl: resultStr,
        fileName: file.name,
      });
    };
    reader.onerror = () => {
      setImageError('Failed to read image file.');
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    setImageError(null);
  };

  const toggleVoiceRecording = () => {
    setVoiceNotice(null);

    // If currently listening, stop it
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      initialTextRef.current = '';
      return;
    }

    // Check browser speech recognition capability
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Record any text already typed before activating mic
      initialTextRef.current = text.trim();

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening... Speak your movie memory or question clearly.');
      };

      // Accumulate entire transcript from index 0 across results, avoiding interim repeats
      recognition.onresult = (event: any) => {
        let spokenTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          spokenTranscript += event.results[i][0].transcript;
        }
        const cleanSpoken = spokenTranscript.trim();
        if (cleanSpoken) {
          const base = initialTextRef.current;
          setText(base ? `${base} ${cleanSpoken}` : cleanSpoken);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        initialTextRef.current = '';
        if (event.error === 'not-allowed') {
          setVoiceNotice('Microphone access denied. Please grant permission in browser settings.');
        } else {
          setVoiceNotice(`Microphone error: ${event.error}. You can continue by typing.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        initialTextRef.current = '';
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      initialTextRef.current = '';
      setVoiceNotice(`Unable to activate microphone: ${err.message || 'Permission or device error'}`);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      initialTextRef.current = '';
    }

    const trimmed = text.trim();
    if (!trimmed && !attachedImage) return;

    onSendMessage(
      trimmed,
      attachedImage
        ? {
            mimeType: attachedImage.mimeType,
            base64Data: attachedImage.base64Data,
            previewUrl: attachedImage.previewUrl,
          }
        : undefined
    );

    setText('');
    setAttachedImage(null);
    setImageError(null);
    setVoiceNotice(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 w-full bg-[#0c0d0e]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 pb-5">
      <div className="max-w-3xl mx-auto">
        {/* Validation or Voice Status Banner */}
        {(imageError || voiceNotice) && (
          <div className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{imageError || voiceNotice}</span>
            </div>
            <button
              onClick={() => {
                setImageError(null);
                setVoiceNotice(null);
              }}
              className="p-1 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Attached image preview */}
        {attachedImage && (
          <div className="mb-2.5 flex items-center gap-2.5 p-2 rounded-lg bg-[#181a1d] border border-white/10 w-fit">
            <img
              src={attachedImage.previewUrl}
              alt="Attached preview"
              className="w-12 h-12 object-cover rounded border border-white/10"
            />
            <div className="text-xs">
              <p className="text-stone-200 font-medium truncate max-w-xs">{attachedImage.fileName}</p>
              <span className="text-[10px] text-amber-400/90 font-mono uppercase">
                Ready to analyze for clues
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1 hover:bg-white/10 rounded-full text-stone-400 hover:text-stone-200 transition-colors ml-2"
              title="Remove image"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Composer Form */}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-[#16181b] rounded-2xl border border-white/15 focus-within:border-amber-500/50 p-2 shadow-xl transition-all">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
            id="composer-image-upload"
          />

          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-white/5 rounded-xl transition-colors shrink-0 disabled:opacity-40"
            title="Attach a poster, scene screenshot, or clue image (JPEG, PNG, WebP up to 5MB)"
            aria-label="Attach poster or scene image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Voice dictation button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            disabled={isLoading}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-amber-500 text-black animate-pulse'
                : 'text-stone-400 hover:text-stone-200 hover:bg-white/5 disabled:opacity-40'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input (Dictate plot memories or movie request)'}
            aria-label={isListening ? 'Stop microphone' : 'Start microphone dictation'}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Describe a mood, remembered scene, or ask where to watch...'
            }
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent border-0 text-sm text-stone-100 placeholder-stone-500 focus:ring-0 focus:outline-none resize-none py-2 px-1 max-h-40 leading-relaxed"
          />

          {/* Action buttons: Send / Loading / Cancel */}
          <div className="flex items-center gap-1 shrink-0 pb-0.5">
            {isLoading ? (
              <button
                type="button"
                onClick={onCancelRequest}
                className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white transition-colors flex items-center justify-center"
                title="Cancel request"
                aria-label="Cancel model request"
              >
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!text.trim() && !attachedImage}
                className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-30 disabled:hover:bg-amber-600 transition-all shadow-md shadow-amber-950/40"
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Footer Guidance Note */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 px-2 font-mono">
          <span>Enter to send • Shift + Enter for newline</span>
          <span className="hidden sm:inline">Untrusted media sanitized • No live showtime fabrication</span>
        </div>
      </div>
    </div>
  );
};
