"use client"

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { RouteAddress } from "@/lib/route-manager"

interface ManageAddressesPanelProps {
  addresses: RouteAddress[]
  onDragEnd: (result: DropResult) => void
  onRemove: (id: string) => void
}

export function ManageAddressesPanel({
  addresses,
  onDragEnd,
  onRemove,
}: ManageAddressesPanelProps) {
  if (addresses.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Ordem de entrega</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="address-list-panel">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-2 max-h-60 overflow-auto"
            >
              {addresses.map((address, index) => (
                <Draggable
                  key={address.id}
                  draggableId={address.id}
                  index={index}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center justify-between border rounded-md p-2"
                      style={provided.draggableProps.style}
                    >
                      <div className="flex items-center gap-3">
                        <Badge>{index + 1}</Badge>
                        <div className="text-xs truncate max-w-[240px]">
                          <strong>{address.description}</strong>
                          <br />
                          CEP: {address.cep}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(address.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
