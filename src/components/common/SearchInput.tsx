import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск…',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [local, setLocal] = useState(value)
  const debounced = useDebounce(local, 350)

  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    if (debounced !== value) onChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className="relative w-full max-w-xs">
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        value={local}
        onChange={e => setLocal(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-border-input bg-white pl-9 pr-3 text-sm outline-none focus:border-primary"
      />
    </div>
  )
}
