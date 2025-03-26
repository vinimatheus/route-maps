"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { RouteAddress } from "@/lib/route-manager";
import { cn } from "@/lib/utils";

interface ManageAddressesPanelProps {
  addresses: RouteAddress[];
  onDragEnd: (result: DropResult) => void;
  onRemove: (id: string) => void;
}

export function ManageAddressesPanel({
  addresses,
  onDragEnd,
  onRemove,
}: ManageAddressesPanelProps) {
  if (addresses.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Ordem de entrega
      </h3>
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
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        "flex items-center justify-between border border-slate-200 p-2 rounded-lg bg-slate-50 shadow-sm transition-all",
                        snapshot.isDragging && "ring-2 ring-indigo-300"
                      )}
                      style={provided.draggableProps.style}
                    >
                      <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-100 text-indigo-700">
                          {index + 1}
                        </Badge>
                        <div className="text-xs text-gray-600 max-w-[240px] truncate">
                          <strong>{address.description}</strong>
                          <br />
                          CEP: {address.cep}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50"
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
  );
}
