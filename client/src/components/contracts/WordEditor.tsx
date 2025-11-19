"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Save, X } from "lucide-react";
import mammoth from "mammoth";
import { useToast } from "@/hooks/use-toast";

interface WordEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (htmlContent: string) => void;
}

export function WordEditor({ open, onOpenChange, onSave }: WordEditorProps) {
  const { toast } = useToast();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".docx") && !file.name.endsWith(".doc")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file Word (.docx hoặc .doc)",
        variant: "destructive",
      });
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(result.value);
      setIsEditing(true);
      toast({
        title: "Thành công",
        description: "Đã tải file Word thành công",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đọc file Word",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (onSave) {
        onSave(content);
      }
      toast({
        title: "Thành công",
        description: "Đã lưu nội dung",
      });
    }
  };

  const handleClear = () => {
    setHtmlContent("");
    setIsEditing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hợp đồng từ file Word</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isEditing ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <Label htmlFor="word-file" className="cursor-pointer">
                <span className="text-lg font-semibold">Tải lên file Word</span>
                <p className="text-sm text-muted-foreground mt-2">
                  Chọn file .docx hoặc .doc để chỉnh sửa
                </p>
              </Label>
              <Input
                id="word-file"
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Button onClick={handleSave} variant="default">
                  <Save className="h-4 w-4 mr-2" />
                  Lưu
                </Button>
                <Button onClick={handleClear} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Xóa và tải lại
                </Button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className="min-h-[500px] p-4 border rounded-lg prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-primary"
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: "13pt",
                  lineHeight: "1.6",
                }}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

