'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  className = '',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const selectRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(option => option.value === value)
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setSearchTerm('')
    }
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Select Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-left
          focus:outline-none focus:border-blue-500 transition-all duration-200
          flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
          ${isOpen ? 'border-blue-500 bg-white/10' : ''}
        `}
      >
        <span className={`${selectedOption ? 'text-white' : 'text-white/60'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-white/60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            {options.length > 5 && (
              <div className="p-3 border-b border-white/10">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-white/10 transition-colors
                      flex items-center justify-between group
                      ${option.value === value ? 'bg-blue-600/20 text-blue-400' : 'text-white'}
                    `}
                  >
                    <span className="text-sm">{option.label}</span>
                    {option.value === value && (
                      <Check className="w-4 h-4 text-blue-400" />
                    )}
                  </motion.button>
                ))
              ) : (
                <div className="px-4 py-3 text-white/60 text-sm text-center">
                  Nenhuma opção encontrada
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}