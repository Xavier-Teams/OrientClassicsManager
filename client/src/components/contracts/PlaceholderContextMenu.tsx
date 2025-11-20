"use client";

import { useState, useRef, useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface Placeholder {
  key: string;
  label: string;
  category?: string;
}

interface PlaceholderContextMenuProps {
  children: React.ReactNode;
  placeholders: Placeholder[];
  onInsert: (placeholder: string) => void;
}

const CATEGORIES = {
  contract: "Thông tin hợp đồng",
  work: "Thông tin tác phẩm",
  translator: "Thông tin dịch giả",
  dates: "Ngày tháng",
  financial: "Thông tin tài chính",
  financial_words: "Thông tin tài chính (bằng chữ)",
};

export function PlaceholderContextMenu({
  children,
  placeholders,
  onInsert,
}: PlaceholderContextMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Group placeholders by category
  const groupedPlaceholders = placeholders.reduce((acc, placeholder) => {
    let category = "other";
    
    if (placeholder.key.includes("contract")) category = "contract";
    else if (placeholder.key.includes("work")) category = "work";
    else if (placeholder.key.includes("translator")) category = "translator";
    else if (placeholder.key.includes("date")) category = "dates";
    else if (placeholder.key.includes("_words")) category = "financial_words";
    else if (
      placeholder.key.includes("amount") ||
      placeholder.key.includes("cost") ||
      placeholder.key.includes("payment") ||
      placeholder.key.includes("price")
    ) {
      category = "financial";
    }

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(placeholder);
    return acc;
  }, {} as Record<string, Placeholder[]>);

  // Filter placeholders based on search
  const filteredPlaceholders = searchQuery
    ? placeholders.filter(
        (p) =>
          p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : placeholders;

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  return (
    <ContextMenu onOpenChange={setIsOpen}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-80 max-h-96 overflow-hidden flex flex-col">
        <div className="p-2 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Tìm kiếm trường dữ liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {searchQuery ? (
            // Show filtered results when searching
            <>
              {filteredPlaceholders.length > 0 ? (
                filteredPlaceholders.map((placeholder) => (
                  <ContextMenuItem
                    key={placeholder.key}
                    onSelect={(e) => {
                      e.preventDefault();
                      onInsert(placeholder.key);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex flex-col items-start"
                  >
                    <span className="font-medium">{placeholder.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {placeholder.key}
                    </span>
                  </ContextMenuItem>
                ))
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Không tìm thấy trường dữ liệu nào
                </div>
              )}
            </>
          ) : (
            // Show grouped categories when not searching
            <>
              {Object.entries(groupedPlaceholders).map(([category, items]) => (
                <ContextMenuSub key={category}>
                  <ContextMenuSubTrigger>
                    {CATEGORIES[category as keyof typeof CATEGORIES] || category}
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-64 max-h-64 overflow-y-auto">
                    {items.map((placeholder) => (
                      <ContextMenuItem
                        key={placeholder.key}
                        onSelect={(e) => {
                          e.preventDefault();
                          onInsert(placeholder.key);
                          setIsOpen(false);
                        }}
                        className="flex flex-col items-start"
                      >
                        <span className="font-medium">{placeholder.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {placeholder.key}
                        </span>
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              ))}
            </>
          )}
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}

