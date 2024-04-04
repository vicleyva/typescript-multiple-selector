import { useEffect, useRef, useState } from 'react'
import styles from './select.module.css'

export type SelectOption = {
    label: string
    value: string | number
}

type MultipleSelectProps = {
    multiple: true
    value?: SelectOption[]
    onChange: (value: SelectOption[]) => void
}

type SingleSelectProps = {
    multiple?: false
    value?: SelectOption
    onChange: (value: SelectOption | undefined) => void
}

type SelectProps = {
    options: SelectOption[]
} & (SingleSelectProps | MultipleSelectProps)

export const Select = ({ multiple, value, onChange, options }: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const clearOptions = () => {
        multiple ? onChange([]) : onChange(undefined)
    }

    const selectOption = (option: SelectOption) => {
        if (multiple) {
            if (value?.includes(option)) {
                onChange(value.filter(o => o !== option))
            } else {
                onChange([...(value || []), option])
            }
        } else {
            if (option !== value) onChange(option)
        }
    }

    const isOptionSelected = (option: SelectOption) => {
        return multiple ? value?.includes(option) : option === value
    }

    useEffect(() => {
        setHighlightedIndex(0)
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target !== containerRef.current) return
            switch (e.code) {
                case 'Escape':
                    setIsOpen(false)
                    break;
                case 'Enter':
                case 'Space':
                    setIsOpen(prev => !prev)
                    if (isOpen) selectOption(options[highlightedIndex])
                    break;
                case 'ArrowUp':
                case 'ArrowDown': {
                    if (!isOpen) {
                        setIsOpen(true)
                        return
                    }
                    const newValue = highlightedIndex + (e.code === 'ArrowDown' ? 1 : -1)
                    if (newValue >= 0 && newValue < options.length) {
                        setHighlightedIndex(newValue)
                    }
                    break;
                }
            }
        }
        containerRef.current?.addEventListener('keydown', handler)
        return () => {
            containerRef.current?.removeEventListener('keydown', handler)
        }
    }, [isOpen, highlightedIndex, options])


    return (
        <div
            ref={containerRef}
            onBlur={() => setIsOpen(false)}
            onClick={() => setIsOpen(prev => !prev)}
            className={styles.container}
            tabIndex={0}
        >
            <span className={styles.value}>{multiple ? value?.map(v => (
                <button
                    className={`${styles['option-badge']}`}
                    key={v.value}
                    onClick={e => {
                        e.stopPropagation()
                        selectOption(v)
                    }}
                >
                    {v.label}
                    <span className={`${styles['remove-btn']}`}>&times;</span>
                </button>
            )) : value?.label}</span>
            <button onClick={(e) => {
                e.stopPropagation()
                clearOptions()
            }} className={styles['clear-btn']}>&times;</button>
            <div className={styles.divider}></div>
            <div className={styles.caret}></div>
            <ul className={`${styles.options} ${isOpen ? styles.show : ''}`}>
                {options.map((option, index) => (
                    <li
                        onClick={e => {
                            e.stopPropagation()
                            selectOption(option)
                            setIsOpen(false)
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        key={option.value}
                        className={`${styles.option} ${isOptionSelected(option) ? styles.selected : ''} ${highlightedIndex === index ? styles.highlighted : ''}`}
                    >
                        {option.label}
                    </li>
                ))}
            </ul>
        </div>
    )
};
