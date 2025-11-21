"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Save, Edit, X } from "lucide-react";
import { ContractFormValues } from "@/components/contracts/ContractForm";
import { ContractTemplate, Work, Translator } from "@/lib/api";
import { mergeTemplateContent } from "@/lib/contractTemplateMerge";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ContractPreviewFromTemplateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ContractTemplate | null;
  formData: ContractFormValues;
  work?: Work;
  translator?: Translator;
  onSave?: (content: string) => void;
}

export function ContractPreviewFromTemplate({
  open,
  onOpenChange,
  template,
  formData,
  work,
  translator,
  onSave,
}: ContractPreviewFromTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<string>("");

  // Merge template content with form data
  const mergedContent = template
    ? mergeTemplateContent(template.content || "", formData, work, translator)
    : "";

  // Initialize edited content when template changes
  useEffect(() => {
    if (template && mergedContent) {
      setEditedContent(mergedContent);
    }
  }, [template, mergedContent]);

  // Check if content has full HTML structure
  const hasHtmlStructure =
    editedContent.trim().toLowerCase().startsWith("<!doctype") ||
    editedContent.trim().toLowerCase().startsWith("<html");

  // Extract body content if full HTML structure
  const getBodyContent = (html: string): string => {
    if (hasHtmlStructure) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      return bodyMatch ? bodyMatch[1] : html;
    }
    return html;
  };

  // Get full HTML with proper structure
  const getFullHtml = (content: string): string => {
    if (hasHtmlStructure) {
      return content;
    }

    // Extract styles from content if exists
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const extractedStyles = styleMatch ? styleMatch[1] : "";

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hợp đồng ${formData.contract_number || ""}</title>
  <style>
    ${extractedStyles}
    body {
      font-family: "Times New Roman", serif;
      font-size: 13pt;
      line-height: 1.6;
      margin: 0;
      padding: 40px;
      color: #000;
      max-width: 210mm;
      margin: 0 auto;
    }
    * {
      box-sizing: border-box;
    }
    p {
      margin: 0.5em 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    td, th {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }
    strong {
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
    u {
      text-decoration: underline;
    }
    @media print {
      body {
        margin: 0;
        padding: 20mm;
      }
      @page {
        size: A4;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const fullHtml = getFullHtml(editedContent);
        printWindow.document.write(fullHtml);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handleDownloadHTML = () => {
    const fullHtml = getFullHtml(editedContent);
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Hop-dong-${formData.contract_number || "new"}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Thành công",
      description: "Đã tải xuống file HTML",
    });
  };

  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setEditedContent(content);
      setIsEditing(false);
      if (onSave) {
        onSave(content);
      }
      toast({
        title: "Thành công",
        description: "Đã lưu chỉnh sửa",
      });
    }
  };

  const handleCancelEdit = () => {
    // Reset to original merged content
    setEditedContent(mergedContent);
    setIsEditing(false);
    if (editorRef.current) {
      editorRef.current.innerHTML = mergedContent;
    }
  };

  // Update editor content when switching to edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = editedContent;
      editorRef.current.focus();
    }
  }, [isEditing]);

  if (!template) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Xem trước hợp đồng - {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="flex gap-2 mb-4 flex-wrap border-b pb-4">
            {!isEditing ? (
              <>
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  In hợp đồng
                </Button>
                <Button onClick={handleDownloadHTML} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống HTML
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSave} variant="default" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Lưu chỉnh sửa
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto border rounded-md">
            {isEditing ? (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-full p-8 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{
                  fontFamily: '"Times New Roman", serif',
                  fontSize: "13pt",
                  lineHeight: 1.6,
                  color: "#000",
                }}
                onInput={(e) => {
                  if (editorRef.current) {
                    setEditedContent(editorRef.current.innerHTML);
                  }
                }}
              />
            ) : (
              <div
                ref={printRef}
                className="contract-preview p-8"
                dangerouslySetInnerHTML={{ __html: editedContent }}
                style={{
                  fontFamily: '"Times New Roman", serif',
                  fontSize: "13pt",
                  lineHeight: 1.6,
                  color: "#000",
                }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

