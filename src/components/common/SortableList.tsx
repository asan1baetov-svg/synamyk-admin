import type { ReactNode } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface SortableListProps<T> {
  items: T[]
  getId: (item: T) => string | number
  onReorder: (next: T[], movedId: string | number) => void
  renderItem: (item: T, dragHandle: ReactNode) => ReactNode
  disabled?: boolean
}

function Row({
  id,
  disabled,
  children,
}: {
  id: string | number
  disabled?: boolean
  children: (handle: ReactNode) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  })

  const handle = (
    <button
      type="button"
      className="cursor-grab touch-none text-neutral-400 hover:text-foreground active:cursor-grabbing"
      {...attributes}
      {...listeners}
      aria-label="Перетащить"
    >
      <GripVertical size={16} />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      {children(handle)}
    </div>
  )
}

export function SortableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  disabled,
}: SortableListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => getId(i) === active.id)
    const newIndex = items.findIndex(i => getId(i) === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(arrayMove(items, oldIndex, newIndex), active.id)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => getId(i))} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map(item => (
            <Row key={getId(item)} id={getId(item)} disabled={disabled}>
              {handle => renderItem(item, handle)}
            </Row>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
