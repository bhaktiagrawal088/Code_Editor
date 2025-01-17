"use client";
import { useCodeEditorStore } from '@/store/useCodeEditorStore';
import React, { useEffect, useState } from 'react'
import { LANGUAGE_CONFIG } from '../_constants';
import Image from 'next/image';
import { RotateCcwIcon, ShareIcon, TypeIcon } from 'lucide-react';
import useMounted from '@/hooks/useMounted';
import { motion } from "framer-motion";

function EditorPanel() {

  const [isShareDialogOpen, SetIsShareDialogOpen] = useState(false);
  const { language, theme, fontSize, editor, setFontSize, setEditor} = useCodeEditorStore();
  const mounted = useMounted();

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;
    if(editor) editor.setValue(newCode)
  },[language,editor])

  useEffect(() => {
    const savedFontSize  = localStorage.getItem("editor-font-size");
    if(savedFontSize) setFontSize(parseInt(savedFontSize))
  },[setFontSize])

  const handleRefresh = () => {
    const defaultCode  = LANGUAGE_CONFIG[language].defaultCode
    if(editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`)
  }

  const handleEditorChange = (value : string | undefined) => {
    if(value) localStorage.setItem(`editor-code-${language}`, value)
  }

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize,12), 24);
    setFontSize(size);
    localStorage.setItem('editor-font-size', size.toString())
  }

  if(!mounted) return null;

  return (
    <div className='relative'>
      <div className='relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.5] p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center size-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5'>
              <Image src={"/" + language + ".png"} alt="Logo" width={24} height={24}/>
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">Write and execute your code</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400"/>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>


            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-4 text-gray-400" />
            </motion.button>


            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => SetIsShareDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
               from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
            >
              <ShareIcon className="size-4 text-white" />
              <span className="text-sm font-medium text-white ">Share</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorPanel
