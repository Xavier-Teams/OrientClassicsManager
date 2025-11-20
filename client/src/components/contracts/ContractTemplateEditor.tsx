"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Upload,
  FileText,
  Save,
  Loader2,
  Type,
  Palette,
  Minus,
  Plus,
  AlignJustify,
  Indent,
  Outdent,
  Table,
  Undo,
  Redo,
  Copy,
  ArrowLeft,
  Strikethrough,
  Subscript,
  Superscript,
  Link,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Eraser,
  Search,
  Replace,
  FileType,
  Highlighter,
  MoreHorizontal,
} from "lucide-react";
import mammoth from "mammoth";
import { apiClient, ContractTemplate } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PlaceholderContextMenu } from "./PlaceholderContextMenu";
import { Eye, Edit, X } from "lucide-react";

interface ContractTemplateEditorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  template?: ContractTemplate | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

type TemplateFormValues = {
  name: string;
  description: string;
  type: "rich_text" | "word_file";
  content: string;
  file: File | null;
  translation_part: string;
  is_default: boolean;
  is_draft?: boolean;
};

// Available placeholders for template
const PLACEHOLDERS = [
  { key: "{{contract_number}}", label: "Số hợp đồng" },
  { key: "{{contract_date}}", label: "Ngày hợp đồng" },
  { key: "{{work_name}}", label: "Tên tác phẩm" },
  { key: "{{translator_name}}", label: "Tên dịch giả" },
  { key: "{{translator_id_card}}", label: "CMND/CCCD dịch giả" },
  { key: "{{translator_address}}", label: "Địa chỉ dịch giả" },
  { key: "{{translator_phone}}", label: "Số điện thoại dịch giả" },
  { key: "{{translator_email}}", label: "Email dịch giả" },
  { key: "{{translator_bank_account}}", label: "Số tài khoản ngân hàng" },
  { key: "{{translator_bank_name}}", label: "Tên ngân hàng" },
  { key: "{{translator_bank_branch}}", label: "Chi nhánh ngân hàng" },
  { key: "{{translator_tax_code}}", label: "Mã số thuế" },
  { key: "{{start_date}}", label: "Ngày bắt đầu" },
  { key: "{{end_date}}", label: "Ngày kết thúc" },
  { key: "{{base_page_count}}", label: "Số trang cơ sở" },
  { key: "{{translation_unit_price}}", label: "Đơn giá dịch thuật" },
  { key: "{{translation_cost}}", label: "Kinh phí dịch thuật" },
  {
    key: "{{translation_cost_words}}",
    label: "Kinh phí dịch thuật (bằng chữ)",
  },
  { key: "{{overview_writing_cost}}", label: "Kinh phí viết bài tổng quan" },
  {
    key: "{{overview_writing_cost_words}}",
    label: "Kinh phí viết bài tổng quan (bằng chữ)",
  },
  { key: "{{total_amount}}", label: "Tổng giá trị hợp đồng" },
  { key: "{{total_amount_words}}", label: "Tổng giá trị hợp đồng (bằng chữ)" },
  { key: "{{advance_payment_1_percent}}", label: "Tỷ lệ tạm ứng lần 1 (%)" },
  { key: "{{advance_payment_1}}", label: "Số tiền tạm ứng lần 1" },
  {
    key: "{{advance_payment_1_words}}",
    label: "Số tiền tạm ứng lần 1 (bằng chữ)",
  },
  { key: "{{advance_payment_2_percent}}", label: "Tỷ lệ tạm ứng lần 2 (%)" },
  { key: "{{advance_payment_2}}", label: "Số tiền tạm ứng lần 2" },
  {
    key: "{{advance_payment_2_words}}",
    label: "Số tiền tạm ứng lần 2 (bằng chữ)",
  },
  { key: "{{final_payment}}", label: "Số tiền quyết toán" },
  { key: "{{final_payment_words}}", label: "Số tiền quyết toán (bằng chữ)" },
];

export function ContractTemplateEditor({
  open = true,
  onOpenChange,
  template,
  onSuccess,
  onClose,
}: ContractTemplateEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"rich_text" | "word_file">(
    "rich_text"
  );
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingContentRef = useRef(false);

  // Undo/Redo history
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Format painter
  const copiedFormatRef = useRef<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: string;
    fontColor?: string;
    backgroundColor?: string;
    align?: string;
  } | null>(null);
  const [hasCopiedFormat, setHasCopiedFormat] = useState(false);

  // Find and Replace
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const form = useForm<TemplateFormValues>({
    defaultValues: {
      name: "",
      description: "",
      type: "rich_text",
      content: "",
      file: null,
      translation_part: "",
      is_default: false,
    },
  });

  const templateType = form.watch("type");

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        description: template.description || "",
        type: template.type,
        content: template.content || "",
        file: null,
        translation_part: template.translation_part || "",
        is_default: template.is_default || false,
      });
      setActiveTab(template.type);
      if (template.file_url) {
        setFilePreview(template.file_url);
      }
      // Update editor content without resetting cursor
      if (editorRef.current && template.content) {
        isUpdatingContentRef.current = true;
        editorRef.current.innerHTML = template.content;
        // Initialize history with template content
        historyRef.current = [template.content];
        historyIndexRef.current = 0;
        setCanUndo(false);
        setCanRedo(false);
        setTimeout(() => {
          isUpdatingContentRef.current = false;
        }, 0);
      }
    } else {
      form.reset({
        name: "",
        description: "",
        type: "rich_text",
        content: "",
        file: null,
        translation_part: "",
        is_default: false,
        is_draft: false,
      });
      setIsDraft(false);
      setActiveTab("rich_text");
      setFilePreview(null);
      if (editorRef.current) {
        isUpdatingContentRef.current = true;
        editorRef.current.innerHTML = "";
        // Initialize history with empty content
        historyRef.current = [""];
        historyIndexRef.current = 0;
        setCanUndo(false);
        setCanRedo(false);
        setTimeout(() => {
          isUpdatingContentRef.current = false;
        }, 0);
      }
    }
  }, [template, form, open]);

  // Keyboard shortcuts for undo/redo and find
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+F (find)
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowFindReplace(true);
        return;
      }

      // Only handle shortcuts when editor is focused
      if (!editorRef.current?.contains(document.activeElement)) return;

      // Check for Ctrl+Z (undo) or Ctrl+Y (redo)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          if (historyIndexRef.current > 0 && editorRef.current) {
            historyIndexRef.current--;
            const previousContent = historyRef.current[historyIndexRef.current];
            isUpdatingContentRef.current = true;
            editorRef.current.innerHTML = previousContent;
            form.setValue("content", previousContent);
            setTimeout(() => {
              isUpdatingContentRef.current = false;
              setCanUndo(historyIndexRef.current > 0);
              setCanRedo(
                historyIndexRef.current < historyRef.current.length - 1
              );
            }, 0);
          }
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          if (
            historyIndexRef.current < historyRef.current.length - 1 &&
            editorRef.current
          ) {
            historyIndexRef.current++;
            const nextContent = historyRef.current[historyIndexRef.current];
            isUpdatingContentRef.current = true;
            editorRef.current.innerHTML = nextContent;
            form.setValue("content", nextContent);
            setTimeout(() => {
              isUpdatingContentRef.current = false;
              setCanUndo(historyIndexRef.current > 0);
              setCanRedo(
                historyIndexRef.current < historyRef.current.length - 1
              );
            }, 0);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [form]);

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      return apiClient.createContractTemplate({
        name: data.name,
        description: data.description,
        type: data.type,
        content: data.type === "rich_text" ? data.content : undefined,
        file: data.type === "word_file" ? data.file || undefined : undefined,
        translation_part: data.translation_part || undefined,
        is_default: data.is_default,
      });
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã tạo mẫu hợp đồng thành công",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo mẫu hợp đồng",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      if (!template) throw new Error("No template to update");
      return apiClient.updateContractTemplate(template.id, {
        name: data.name,
        description: data.description,
        type: data.type,
        content: data.type === "rich_text" ? data.content : undefined,
        file: data.type === "word_file" ? data.file || undefined : undefined,
        translation_part: data.translation_part || undefined,
        is_default: data.is_default,
      });
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật mẫu hợp đồng thành công",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật mẫu hợp đồng",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: TemplateFormValues) => {
    // Clear draft when submitting
    const draftKey = template
      ? `template-draft-${template.id}`
      : "template-draft-new";
    localStorage.removeItem(draftKey);
    setIsDraft(false);

    if (template) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSaveDraft = () => {
    const formData = form.getValues();
    const draftKey = template
      ? `template-draft-${template.id}`
      : "template-draft-new";
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        ...formData,
        is_draft: true,
        saved_at: new Date().toISOString(),
      })
    );
    setIsDraft(true);
    toast({
      title: "Đã lưu bản nháp",
      description: "Bản nháp đã được lưu. Bạn có thể tiếp tục chỉnh sửa sau.",
    });
  };

  const insertPlaceholder = (placeholder: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(placeholder);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        editorRef.current.focus();
      } else {
        editorRef.current.innerHTML += placeholder;
      }
      const newContent = editorRef.current.innerHTML;
      form.setValue("content", newContent);
      saveToHistory(newContent);
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    return selection.getRangeAt(0);
  };

  const restoreSelection = (range: Range | null) => {
    if (!range || !editorRef.current) return;
    const selection = window.getSelection();
    if (selection) {
      try {
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        // Range might be invalid, ignore
      }
    }
  };

  // Save state to history
  const saveToHistory = (content: string) => {
    if (!editorRef.current) return;

    // Remove future history if we're not at the end
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(
        0,
        historyIndexRef.current + 1
      );
    }

    // Add new state
    historyRef.current.push(content);
    historyIndexRef.current = historyRef.current.length - 1;

    // Limit history size to 50
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }

    // Update button states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndexRef.current > 0 && editorRef.current) {
      historyIndexRef.current--;
      const previousContent = historyRef.current[historyIndexRef.current];
      isUpdatingContentRef.current = true;
      editorRef.current.innerHTML = previousContent;
      form.setValue("content", previousContent);
      setTimeout(() => {
        isUpdatingContentRef.current = false;
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      }, 0);
    }
  };

  // Redo function
  const handleRedo = () => {
    if (
      historyIndexRef.current < historyRef.current.length - 1 &&
      editorRef.current
    ) {
      historyIndexRef.current++;
      const nextContent = historyRef.current[historyIndexRef.current];
      isUpdatingContentRef.current = true;
      editorRef.current.innerHTML = nextContent;
      form.setValue("content", nextContent);
      setTimeout(() => {
        isUpdatingContentRef.current = false;
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      }, 0);
    }
  };

  // Copy format function
  const handleCopyFormat = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : (container as HTMLElement);

    if (!element) return;

    const computedStyle = window.getComputedStyle(element);
    copiedFormatRef.current = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      fontSize: computedStyle.fontSize,
      fontColor: computedStyle.color,
      backgroundColor:
        computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)"
          ? computedStyle.backgroundColor
          : undefined,
      align: computedStyle.textAlign,
    };

    setHasCopiedFormat(true);
    toast({
      title: "Đã sao chép định dạng",
      description:
        "Định dạng đã được sao chép. Chọn văn bản và nhấn 'Dán định dạng' để áp dụng.",
    });
  };

  // Paste format function
  const handlePasteFormat = () => {
    if (!copiedFormatRef.current || !editorRef.current) {
      toast({
        title: "Chưa có định dạng",
        description: "Vui lòng sao chép định dạng trước.",
        variant: "destructive",
      });
      return;
    }

    const savedRange = saveSelection();
    const format = copiedFormatRef.current;

    // Apply formatting
    if (format.bold !== undefined) {
      document.execCommand("bold", false, undefined);
    }
    if (format.italic !== undefined) {
      document.execCommand("italic", false, undefined);
    }
    if (format.underline !== undefined) {
      document.execCommand("underline", false, undefined);
    }
    if (format.fontSize) {
      // Convert px to font size number (approximate)
      const size = parseInt(format.fontSize);
      let fontSize = "3";
      if (size <= 10) fontSize = "1";
      else if (size <= 12) fontSize = "2";
      else if (size <= 14) fontSize = "3";
      else if (size <= 16) fontSize = "4";
      else if (size <= 18) fontSize = "5";
      else if (size <= 20) fontSize = "6";
      else if (size <= 24) fontSize = "7";
      else if (size <= 28) fontSize = "8";
      else if (size <= 32) fontSize = "9";
      else fontSize = "10";
      document.execCommand("fontSize", false, fontSize);
    }
    if (format.fontColor) {
      // Extract hex color from rgb/rgba
      const rgbMatch = format.fontColor.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseInt(rgbMatch[0]).toString(16).padStart(2, "0");
        const g = parseInt(rgbMatch[1]).toString(16).padStart(2, "0");
        const b = parseInt(rgbMatch[2]).toString(16).padStart(2, "0");
        document.execCommand("foreColor", false, `#${r}${g}${b}`);
      }
    }
    if (format.backgroundColor) {
      const rgbMatch = format.backgroundColor.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const r = parseInt(rgbMatch[0]).toString(16).padStart(2, "0");
        const g = parseInt(rgbMatch[1]).toString(16).padStart(2, "0");
        const b = parseInt(rgbMatch[2]).toString(16).padStart(2, "0");
        document.execCommand("backColor", false, `#${r}${g}${b}`);
      }
    }
    if (format.align) {
      if (format.align === "left")
        document.execCommand("justifyLeft", false, undefined);
      else if (format.align === "center")
        document.execCommand("justifyCenter", false, undefined);
      else if (format.align === "right")
        document.execCommand("justifyRight", false, undefined);
      else if (format.align === "justify")
        document.execCommand("justifyFull", false, undefined);
    }

    if (editorRef.current) {
      form.setValue("content", editorRef.current.innerHTML);
      saveToHistory(editorRef.current.innerHTML);
      setTimeout(() => {
        if (savedRange) {
          restoreSelection(savedRange);
        }
      }, 0);
    }
  };

  const formatText = (command: string, value?: string) => {
    const savedRange = saveSelection();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      form.setValue("content", newContent);
      saveToHistory(newContent);
      // Restore selection after a brief delay
      setTimeout(() => {
        if (savedRange) {
          restoreSelection(savedRange);
        }
      }, 0);
    }
  };

  const formatParagraph = (property: string, value: string) => {
    if (editorRef.current) {
      const savedRange = saveSelection();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedElement =
          range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentElement
            : (range.commonAncestorContainer as HTMLElement);

        if (selectedElement) {
          const paragraph =
            selectedElement.closest("p") ||
            selectedElement.closest("div") ||
            selectedElement;
          if (paragraph instanceof HTMLElement) {
            paragraph.style.setProperty(property, value);
            const newContent = editorRef.current.innerHTML;
            form.setValue("content", newContent);
            saveToHistory(newContent);
            // Restore selection
            setTimeout(() => {
              if (savedRange) {
                restoreSelection(savedRange);
              }
            }, 0);
          }
        }
      }
    }
  };

  const insertTable = (rows: number, cols: number) => {
    if (editorRef.current) {
      const savedRange = saveSelection();
      let tableHTML =
        '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
      for (let i = 0; i < rows; i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < cols; j++) {
          tableHTML += "<td>&nbsp;</td>";
        }
        tableHTML += "</tr>";
      }
      tableHTML += "</table>";

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create table element directly
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = tableHTML;
        const tableElement = tempDiv.firstChild as HTMLTableElement;

        if (tableElement) {
          // Insert table into range
          range.insertNode(tableElement);

          // Move cursor after table - use the inserted table element, not fragment
          try {
            range.setStartAfter(tableElement);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (e) {
            // Fallback: place cursor at end of editor
            const newRange = document.createRange();
            newRange.selectNodeContents(editorRef.current);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      } else {
        // If no selection, append to end
        editorRef.current.innerHTML += tableHTML;
        // Place cursor at end
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      const newContent = editorRef.current.innerHTML;
      form.setValue("content", newContent);
      saveToHistory(newContent);
      editorRef.current.focus();
    }
  };

  const setFontSize = (size: string) => {
    formatText("fontSize", size);
  };

  const setFontColor = (color: string) => {
    formatText("foreColor", color);
  };

  const setBackgroundColor = (color: string) => {
    formatText("backColor", color);
  };

  const setLineHeight = (value: string) => {
    formatParagraph("line-height", value);
  };

  const setLetterSpacing = (value: string) => {
    formatParagraph("letter-spacing", value);
  };

  const setTextIndent = (value: string) => {
    formatParagraph("text-indent", value);
  };

  // Strikethrough
  const toggleStrikethrough = () => {
    formatText("strikeThrough");
  };

  // Subscript
  const toggleSubscript = () => {
    formatText("subscript");
  };

  // Superscript
  const toggleSuperscript = () => {
    formatText("superscript");
  };

  // Insert ordered list
  const insertOrderedList = () => {
    formatText("insertOrderedList");
  };

  // Clear formatting
  const clearFormatting = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        if (selectedText) {
          // Remove formatting from selected text
          const textNode = document.createTextNode(selectedText);
          range.deleteContents();
          range.insertNode(textNode);
          range.selectNodeContents(textNode);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // Clear formatting at cursor
          document.execCommand("removeFormat", false, undefined);
        }
        const newContent = editorRef.current.innerHTML;
        form.setValue("content", newContent);
        saveToHistory(newContent);
      }
    }
  };

  // Insert hyperlink
  const insertHyperlink = () => {
    const url = prompt("Nhập URL:", "https://");
    if (url) {
      const text = prompt("Nhập text hiển thị (để trống để dùng URL):", url);
      formatText("createLink", url);
      if (text && text !== url && editorRef.current) {
        // Update link text if provided
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const link =
            range.commonAncestorContainer.nodeType === Node.TEXT_NODE
              ? range.commonAncestorContainer.parentElement?.closest("a")
              : (range.commonAncestorContainer as HTMLElement).closest("a");
          if (link) {
            link.textContent = text;
            const newContent = editorRef.current.innerHTML;
            form.setValue("content", newContent);
            saveToHistory(newContent);
          }
        }
      }
    }
  };

  // Set heading
  const setHeading = (level: 1 | 2 | 3) => {
    if (editorRef.current) {
      const savedRange = saveSelection();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const element =
          container.nodeType === Node.TEXT_NODE
            ? container.parentElement
            : (container as HTMLElement);

        if (element) {
          const heading = document.createElement(`h${level}`);
          heading.innerHTML = element.innerHTML || range.toString();
          element.replaceWith(heading);

          const newContent = editorRef.current.innerHTML;
          form.setValue("content", newContent);
          saveToHistory(newContent);

          setTimeout(() => {
            if (savedRange) {
              restoreSelection(savedRange);
            }
          }, 0);
        }
      }
    }
  };

  // Set font family
  const setFontFamily = (fontFamily: string) => {
    if (editorRef.current) {
      const savedRange = saveSelection();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const element =
          container.nodeType === Node.TEXT_NODE
            ? container.parentElement
            : (container as HTMLElement);

        if (element) {
          const span = document.createElement("span");
          span.style.fontFamily = fontFamily;
          span.innerHTML = element.innerHTML || range.toString();
          element.replaceWith(span);

          const newContent = editorRef.current.innerHTML;
          form.setValue("content", newContent);
          saveToHistory(newContent);

          setTimeout(() => {
            if (savedRange) {
              restoreSelection(savedRange);
            }
          }, 0);
        }
      }
    }
  };

  // Find and Replace functions
  const handleFind = () => {
    setShowFindReplace(true);
  };

  const handleFindNext = () => {
    if (!findText || !editorRef.current) return;

    const content =
      editorRef.current.innerText || editorRef.current.textContent || "";
    const index = content.toLowerCase().indexOf(findText.toLowerCase());

    if (index === -1) {
      toast({
        title: "Không tìm thấy",
        description: `Không tìm thấy "${findText}"`,
        variant: "destructive",
      });
      return;
    }

    // Highlight found text (simplified - would need more complex implementation for full highlighting)
    editorRef.current.focus();
    toast({
      title: "Đã tìm thấy",
      description: `Tìm thấy "${findText}" tại vị trí ${index}`,
    });
  };

  const handleReplace = () => {
    if (!findText || !editorRef.current) return;

    const content = editorRef.current.innerHTML;
    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    const newContent = content.replace(regex, replaceText);

    if (newContent !== content) {
      isUpdatingContentRef.current = true;
      editorRef.current.innerHTML = newContent;
      form.setValue("content", newContent);
      saveToHistory(newContent);
      setTimeout(() => {
        isUpdatingContentRef.current = false;
      }, 0);

      toast({
        title: "Đã thay thế",
        description: `Đã thay thế "${findText}" bằng "${replaceText}"`,
      });
    } else {
      toast({
        title: "Không tìm thấy",
        description: `Không tìm thấy "${findText}" để thay thế`,
        variant: "destructive",
      });
    }
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) return;

    const content = editorRef.current.innerHTML;
    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    const newContent = content.replace(regex, replaceText);
    const count = (content.match(regex) || []).length;

    if (newContent !== content) {
      isUpdatingContentRef.current = true;
      editorRef.current.innerHTML = newContent;
      form.setValue("content", newContent);
      saveToHistory(newContent);
      setTimeout(() => {
        isUpdatingContentRef.current = false;
      }, 0);

      toast({
        title: "Đã thay thế tất cả",
        description: `Đã thay thế ${count} lần xuất hiện của "${findText}"`,
      });
    } else {
      toast({
        title: "Không tìm thấy",
        description: `Không tìm thấy "${findText}" để thay thế`,
        variant: "destructive",
      });
    }
  };

  // Calculate word and character count
  const updateWordCount = () => {
    if (editorRef.current) {
      const text =
        editorRef.current.innerText || editorRef.current.textContent || "";
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      setWordCount(words.length);
      setCharCount(text.length);
    }
  };

  // Update word count when content changes
  useEffect(() => {
    updateWordCount();
  }, [form.watch("content")]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".docx") && !file.name.endsWith(".doc")) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn file Word (.docx hoặc .doc)",
          variant: "destructive",
        });
        return;
      }

      // Store original file
      form.setValue("file", file);

      // Convert Word to HTML for editing with better formatting preservation
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Normal'] => p",
            ],
            includeDefaultStyleMap: true,
            convertImage: mammoth.images.imgElement((image) => {
              return image.read("base64").then((imageBuffer) => {
                return {
                  src: `data:${image.contentType};base64,${imageBuffer}`,
                };
              });
            }),
          }
        );

        // Process HTML to preserve formatting better
        let processedHTML = result.value;

        // Create a temporary div to process the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = processedHTML;

        // Preserve paragraph formatting (indentation, alignment, spacing)
        const paragraphs = tempDiv.querySelectorAll("p");
        paragraphs.forEach((p) => {
          const pElement = p as HTMLElement;
          // Preserve text alignment
          const alignment = pElement
            .getAttribute("style")
            ?.match(/text-align:\s*([^;]+)/)?.[1];
          if (alignment) {
            pElement.style.textAlign = alignment;
          }
          // Preserve indentation
          const indent = pElement
            .getAttribute("style")
            ?.match(/text-indent:\s*([^;]+)/)?.[1];
          if (indent) {
            pElement.style.textIndent = indent;
          }
          // Preserve line height
          const lineHeight = pElement
            .getAttribute("style")
            ?.match(/line-height:\s*([^;]+)/)?.[1];
          if (lineHeight) {
            pElement.style.lineHeight = lineHeight;
          }
          // Preserve margin
          const marginLeft = pElement
            .getAttribute("style")
            ?.match(/margin-left:\s*([^;]+)/)?.[1];
          if (marginLeft) {
            pElement.style.marginLeft = marginLeft;
          }
        });

        // Preserve table formatting
        const tables = tempDiv.querySelectorAll("table");
        tables.forEach((table) => {
          const tableElement = table as HTMLElement;
          tableElement.style.borderCollapse = "collapse";
          tableElement.style.width = "100%";
          tableElement.style.margin = "10px 0";
        });

        processedHTML = tempDiv.innerHTML;

        // Convert to rich text editor format
        form.setValue("content", processedHTML);
        form.setValue("type", "rich_text");
        setActiveTab("rich_text");

        // Update editor content without resetting cursor
        if (editorRef.current) {
          isUpdatingContentRef.current = true;
          editorRef.current.innerHTML = processedHTML;
          setTimeout(() => {
            isUpdatingContentRef.current = false;
            // Focus at the end
            const range = document.createRange();
            range.selectNodeContents(editorRef.current!);
            range.collapse(false);
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }, 0);
        }

        toast({
          title: "Thành công",
          description:
            "File Word đã được chuyển đổi sang định dạng soạn thảo. Bạn có thể chỉnh sửa trực tiếp.",
        });
      } catch (error: any) {
        console.error("Error converting Word to HTML:", error);
        toast({
          title: "Lỗi",
          description:
            error.message ||
            "Không thể chuyển đổi file Word. Vui lòng thử lại.",
          variant: "destructive",
        });
        // Fallback to word_file type
        form.setValue("type", "word_file");
        setActiveTab("word_file");
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      }
    }
  };

  // Auto-save draft
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Auto-save after 2 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      const formData = form.getValues();
      if (formData.name || formData.content || formData.file) {
        const draftKey = template
          ? `template-draft-${template.id}`
          : "template-draft-new";
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            ...formData,
            is_draft: true,
            saved_at: new Date().toISOString(),
          })
        );
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [form.watch(), template]);

  // Load draft on mount
  useEffect(() => {
    if (open && !template) {
      const draftData = localStorage.getItem("template-draft-new");
      if (draftData) {
        try {
          const draft = JSON.parse(draftData);
          form.reset(draft);
          setIsDraft(true);
          if (draft.type === "word_file" && draft.file) {
            // Note: File objects can't be restored from localStorage
            // User will need to re-upload the file
          }
        } catch (e) {
          console.error("Error loading draft:", e);
        }
      }
    }
  }, [open, template, form]);

  // Cleanup preview URL and draft when dialog closes
  useEffect(() => {
    if (!open) {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
      }
      // Don't clear draft automatically - let user decide
    }
  }, [open, filePreviewUrl]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    if (isDraft) {
      // Ask user if they want to keep draft
      const keepDraft = window.confirm(
        "Bạn có muốn giữ lại bản nháp không? (Bản nháp đã được lưu tự động)"
      );
      if (!keepDraft) {
        const draftKey = template
          ? `template-draft-${template.id}`
          : "template-draft-new";
        localStorage.removeItem(draftKey);
        setIsDraft(false);
      }
    }
    if (onClose) {
      onClose();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {template ? "Chỉnh sửa mẫu hợp đồng" : "Tạo mẫu hợp đồng mới"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Tạo hoặc chỉnh sửa mẫu hợp đồng. Sử dụng các placeholder để tự
                động điền dữ liệu khi tạo hợp đồng.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Tên mẫu hợp đồng là bắt buộc" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên mẫu hợp đồng</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ví dụ: Hợp đồng dịch thuật Phật tạng tinh yếu"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="translation_part"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hợp phần (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ví dụ: Phật tạng tinh yếu"
                      />
                    </FormControl>
                    <FormDescription>
                      Hợp phần mà mẫu này áp dụng (để trống nếu áp dụng cho tất
                      cả)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Mô tả về mẫu hợp đồng này..."
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Đặt làm mẫu mặc định</FormLabel>
                    <FormDescription>
                      Mẫu này sẽ được chọn mặc định khi tạo hợp đồng mới
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as "rich_text" | "word_file");
                form.setValue("type", v as "rich_text" | "word_file");
              }}>
              <TabsList>
                <TabsTrigger value="rich_text">
                  <FileText className="h-4 w-4 mr-2" />
                  Soạn thảo trực tuyến
                </TabsTrigger>
                <TabsTrigger value="word_file">
                  <Upload className="h-4 w-4 mr-2" />
                  Tải lên file Word
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rich_text" className="space-y-4">
                <div className="border rounded-lg">
                  {/* Toolbar - Multiple Rows */}
                  <div className="flex flex-col gap-1 p-2 border-b bg-muted/50">
                    {/* Row 1: History, Format Painter, Font Styles */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Undo/Redo */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleUndo}
                        disabled={!canUndo}
                        title="Hoàn tác (Ctrl+Z)">
                        <Undo className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRedo}
                        disabled={!canRedo}
                        title="Làm lại (Ctrl+Y)">
                        <Redo className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      {/* Format Painter */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyFormat}
                        title="Sao chép định dạng">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handlePasteFormat}
                        disabled={!hasCopiedFormat}
                        title="Dán định dạng">
                        <Type className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("bold")}
                        title="Đậm">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("italic")}
                        title="Nghiêng">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("underline")}
                        title="Gạch chân">
                        <Underline className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleStrikethrough}
                        title="Gạch ngang">
                        <Strikethrough className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleSubscript}
                        title="Chỉ số dưới">
                        <Subscript className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleSuperscript}
                        title="Chỉ số trên">
                        <Superscript className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      {/* Font Family */}
                      <Select onValueChange={(value) => setFontFamily(value)}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Times New Roman, serif">
                            Times New Roman
                          </SelectItem>
                          <SelectItem value="Arial, sans-serif">
                            Arial
                          </SelectItem>
                          <SelectItem value="Calibri, sans-serif">
                            Calibri
                          </SelectItem>
                          <SelectItem value="Cambria, serif">
                            Cambria
                          </SelectItem>
                          <SelectItem value="Georgia, serif">
                            Georgia
                          </SelectItem>
                          <SelectItem value="Verdana, sans-serif">
                            Verdana
                          </SelectItem>
                          <SelectItem value="Courier New, monospace">
                            Courier New
                          </SelectItem>
                          <SelectItem value="Tahoma, sans-serif">
                            Tahoma
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Font Size */}
                      <Select onValueChange={(value) => setFontSize(value)}>
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue placeholder="Cỡ chữ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">8pt</SelectItem>
                          <SelectItem value="2">10pt</SelectItem>
                          <SelectItem value="3">12pt</SelectItem>
                          <SelectItem value="4">14pt</SelectItem>
                          <SelectItem value="5">16pt</SelectItem>
                          <SelectItem value="6">18pt</SelectItem>
                          <SelectItem value="7">20pt</SelectItem>
                          <SelectItem value="8">24pt</SelectItem>
                          <SelectItem value="9">28pt</SelectItem>
                          <SelectItem value="10">32pt</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Font Color */}
                      <div className="relative">
                        <input
                          type="color"
                          onChange={(e) => setFontColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
                          title="Màu chữ"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          title="Màu chữ"
                          className="relative">
                          <Type className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Background Color */}
                      <div className="relative">
                        <input
                          type="color"
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
                          title="Màu nền"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          title="Màu nền"
                          className="relative">
                          <Palette className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Row 2: Paragraph Formatting, Lists, and Advanced Tools */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Alignment */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("justifyLeft")}
                        title="Căn trái">
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("justifyCenter")}
                        title="Căn giữa">
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("justifyRight")}
                        title="Căn phải">
                        <AlignRight className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("justifyFull")}
                        title="Căn đều">
                        <AlignJustify className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      {/* Indentation */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("outdent")}
                        title="Giảm thụt đầu dòng">
                        <Outdent className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("indent")}
                        title="Tăng thụt đầu dòng">
                        <Indent className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      {/* Headings */}
                      <Select
                        onValueChange={(value) => {
                          if (
                            value === "h1" ||
                            value === "h2" ||
                            value === "h3"
                          ) {
                            setHeading(parseInt(value[1]) as 1 | 2 | 3);
                          } else if (value === "normal") {
                            // Convert heading back to paragraph
                            if (editorRef.current) {
                              const selection = window.getSelection();
                              if (selection && selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);
                                const container = range.commonAncestorContainer;
                                const element =
                                  container.nodeType === Node.TEXT_NODE
                                    ? container.parentElement
                                    : (container as HTMLElement);

                                if (
                                  element &&
                                  (element.tagName === "H1" ||
                                    element.tagName === "H2" ||
                                    element.tagName === "H3")
                                ) {
                                  const p = document.createElement("p");
                                  p.innerHTML = element.innerHTML;
                                  element.replaceWith(p);
                                  const newContent =
                                    editorRef.current.innerHTML;
                                  form.setValue("content", newContent);
                                  saveToHistory(newContent);
                                }
                              }
                            }
                          }
                        }}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Kiểu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Văn bản thường</SelectItem>
                          <SelectItem value="h1">Tiêu đề 1</SelectItem>
                          <SelectItem value="h2">Tiêu đề 2</SelectItem>
                          <SelectItem value="h3">Tiêu đề 3</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="w-px h-6 bg-border mx-1" />

                      {/* Lists */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText("insertUnorderedList")}
                        title="Danh sách dấu đầu dòng">
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={insertOrderedList}
                        title="Danh sách đánh số">
                        <ListOrdered className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      {/* Hyperlink */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={insertHyperlink}
                        title="Chèn liên kết">
                        <Link className="h-4 w-4" />
                      </Button>

                      {/* Clear Formatting */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFormatting}
                        title="Xóa định dạng">
                        <Eraser className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      {/* Find and Replace */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleFind}
                        title="Tìm và thay thế (Ctrl+F)">
                        <Search className="h-4 w-4" />
                      </Button>

                      <div className="w-px h-6 bg-border mx-1" />

                      {/* Table */}
                      <Select
                        onValueChange={(value) => {
                          const [rows, cols] = value.split("x").map(Number);
                          insertTable(rows, cols);
                        }}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Chèn bảng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2x2">2x2</SelectItem>
                          <SelectItem value="2x3">2x3</SelectItem>
                          <SelectItem value="3x3">3x3</SelectItem>
                          <SelectItem value="3x4">3x4</SelectItem>
                          <SelectItem value="4x4">4x4</SelectItem>
                          <SelectItem value="4x5">4x5</SelectItem>
                          <SelectItem value="5x5">5x5</SelectItem>
                          <SelectItem value="6x6">6x6</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const rows = prompt("Số hàng:", "3");
                          const cols = prompt("Số cột:", "3");
                          if (rows && cols) {
                            insertTable(
                              parseInt(rows) || 3,
                              parseInt(cols) || 3
                            );
                          }
                        }}
                        title="Tạo bảng tùy chỉnh">
                        <Table className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Row 3: Spacing Options */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Line Spacing */}
                      <Select onValueChange={(value) => setLineHeight(value)}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Giãn dòng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Đơn (1.0)</SelectItem>
                          <SelectItem value="1.15">1.15</SelectItem>
                          <SelectItem value="1.5">1.5</SelectItem>
                          <SelectItem value="2">Đôi (2.0)</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3">3.0</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Letter Spacing */}
                      <Select
                        onValueChange={(value) => setLetterSpacing(value)}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Khoảng chữ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Bình thường</SelectItem>
                          <SelectItem value="0.5px">Chặt (0.5px)</SelectItem>
                          <SelectItem value="1px">Rộng (1px)</SelectItem>
                          <SelectItem value="2px">Rất rộng (2px)</SelectItem>
                          <SelectItem value="3px">Cực rộng (3px)</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Text Indent */}
                      <Select onValueChange={(value) => setTextIndent(value)}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Thụt đầu dòng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Không</SelectItem>
                          <SelectItem value="1cm">1cm</SelectItem>
                          <SelectItem value="1.27cm">1.27cm</SelectItem>
                          <SelectItem value="1.5cm">1.5cm</SelectItem>
                          <SelectItem value="2cm">2cm</SelectItem>
                          <SelectItem value="2.5cm">2.5cm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Editor */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PlaceholderContextMenu
                            placeholders={PLACEHOLDERS}
                            onInsert={insertPlaceholder}>
                            <div
                              ref={editorRef}
                              contentEditable
                              suppressContentEditableWarning
                              onInput={(e) => {
                                if (
                                  !isUpdatingContentRef.current &&
                                  editorRef.current
                                ) {
                                  const html = editorRef.current.innerHTML;
                                  field.onChange(html);
                                  updateWordCount();
                                  // Save to history with debounce
                                  clearTimeout(autoSaveTimeoutRef.current!);
                                  autoSaveTimeoutRef.current = setTimeout(
                                    () => {
                                      if (editorRef.current) {
                                        saveToHistory(
                                          editorRef.current.innerHTML
                                        );
                                      }
                                    },
                                    500
                                  );
                                }
                              }}
                              onBlur={() => {
                                if (editorRef.current) {
                                  const html = editorRef.current.innerHTML;
                                  field.onChange(html);
                                  updateWordCount();
                                }
                              }}
                              className="min-h-[400px] p-4 prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-primary cursor-text"
                              style={{
                                fontFamily: "Times New Roman, serif",
                                fontSize: "13pt",
                                lineHeight: "1.6",
                              }}
                              dangerouslySetInnerHTML={
                                isUpdatingContentRef.current
                                  ? undefined
                                  : { __html: field.value }
                              }
                            />
                          </PlaceholderContextMenu>
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Nhấp chuột phải để chèn trường dữ liệu
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Placeholders */}
                <div className="border rounded-lg p-4">
                  <Label className="text-sm font-semibold mb-2 block">
                    Chèn placeholder (click để chèn):
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {PLACEHOLDERS.map((placeholder) => (
                      <Button
                        key={placeholder.key}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs justify-start"
                        onClick={() => insertPlaceholder(placeholder.key)}>
                        {placeholder.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="word_file" className="space-y-4">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Word template (.docx)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {filePreview || field.value ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="flex-1 text-sm">
                                  {field.value instanceof File
                                    ? field.value.name
                                    : template?.file_name || "File đã tải lên"}
                                </span>
                                <div className="flex gap-2">
                                  {field.value instanceof File && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={async () => {
                                        // Convert Word to HTML and switch to rich text editor
                                        if (field.value instanceof File) {
                                          try {
                                            const arrayBuffer =
                                              await field.value.arrayBuffer();
                                            const result =
                                              await mammoth.convertToHtml(
                                                { arrayBuffer },
                                                {
                                                  styleMap: [
                                                    "p[style-name='Heading 1'] => h1:fresh",
                                                    "p[style-name='Heading 2'] => h2:fresh",
                                                    "p[style-name='Heading 3'] => h3:fresh",
                                                    "p[style-name='Normal'] => p",
                                                  ],
                                                  includeDefaultStyleMap: true,
                                                  convertImage:
                                                    mammoth.images.imgElement(
                                                      (image) => {
                                                        return image
                                                          .read("base64")
                                                          .then(
                                                            (imageBuffer) => {
                                                              return {
                                                                src: `data:${image.contentType};base64,${imageBuffer}`,
                                                              };
                                                            }
                                                          );
                                                      }
                                                    ),
                                                }
                                              );

                                            // Process HTML to preserve formatting better
                                            let processedHTML = result.value;

                                            // Create a temporary div to process the HTML
                                            const tempDiv =
                                              document.createElement("div");
                                            tempDiv.innerHTML = processedHTML;

                                            // Preserve paragraph formatting
                                            const paragraphs =
                                              tempDiv.querySelectorAll("p");
                                            paragraphs.forEach((p) => {
                                              const pElement = p as HTMLElement;
                                              const alignment = pElement
                                                .getAttribute("style")
                                                ?.match(
                                                  /text-align:\s*([^;]+)/
                                                )?.[1];
                                              if (alignment) {
                                                pElement.style.textAlign =
                                                  alignment;
                                              }
                                              const indent = pElement
                                                .getAttribute("style")
                                                ?.match(
                                                  /text-indent:\s*([^;]+)/
                                                )?.[1];
                                              if (indent) {
                                                pElement.style.textIndent =
                                                  indent;
                                              }
                                              const lineHeight = pElement
                                                .getAttribute("style")
                                                ?.match(
                                                  /line-height:\s*([^;]+)/
                                                )?.[1];
                                              if (lineHeight) {
                                                pElement.style.lineHeight =
                                                  lineHeight;
                                              }
                                              const marginLeft = pElement
                                                .getAttribute("style")
                                                ?.match(
                                                  /margin-left:\s*([^;]+)/
                                                )?.[1];
                                              if (marginLeft) {
                                                pElement.style.marginLeft =
                                                  marginLeft;
                                              }
                                            });

                                            // Preserve table formatting
                                            const tables =
                                              tempDiv.querySelectorAll("table");
                                            tables.forEach((table) => {
                                              const tableElement =
                                                table as HTMLElement;
                                              tableElement.style.borderCollapse =
                                                "collapse";
                                              tableElement.style.width = "100%";
                                              tableElement.style.margin =
                                                "10px 0";
                                            });

                                            processedHTML = tempDiv.innerHTML;

                                            // Switch to rich text editor
                                            form.setValue(
                                              "content",
                                              processedHTML
                                            );
                                            form.setValue("type", "rich_text");
                                            setActiveTab("rich_text");

                                            // Update editor content without resetting cursor
                                            if (editorRef.current) {
                                              isUpdatingContentRef.current =
                                                true;
                                              editorRef.current.innerHTML =
                                                processedHTML;
                                              setTimeout(() => {
                                                isUpdatingContentRef.current =
                                                  false;
                                                // Focus at the end
                                                const range =
                                                  document.createRange();
                                                range.selectNodeContents(
                                                  editorRef.current!
                                                );
                                                range.collapse(false);
                                                const selection =
                                                  window.getSelection();
                                                if (selection) {
                                                  selection.removeAllRanges();
                                                  selection.addRange(range);
                                                }
                                              }, 0);
                                            }

                                            toast({
                                              title: "Thành công",
                                              description:
                                                "File Word đã được chuyển đổi. Bạn có thể chỉnh sửa trực tiếp.",
                                            });
                                          } catch (error: any) {
                                            toast({
                                              title: "Lỗi",
                                              description:
                                                error.message ||
                                                "Không thể chuyển đổi file Word.",
                                              variant: "destructive",
                                            });
                                          }
                                        }
                                      }}
                                      title="Chỉnh sửa file Word">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Chỉnh sửa
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      field.onChange(null);
                                      setFilePreview(null);
                                      if (filePreviewUrl) {
                                        URL.revokeObjectURL(filePreviewUrl);
                                        setFilePreviewUrl(null);
                                      }
                                      if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                      }
                                    }}>
                                    <X className="h-4 w-4 mr-1" />
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                              {field.value instanceof File && (
                                <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950 rounded">
                                  💡 <strong>Mẹo:</strong> Click "Chỉnh sửa" để
                                  chuyển file Word sang định dạng soạn thảo và
                                  chỉnh sửa trực tiếp trong trình duyệt. Định
                                  dạng sẽ được bảo toàn 100%.
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <Label
                                htmlFor="template-file"
                                className="cursor-pointer">
                                <span className="text-lg font-semibold">
                                  Tải lên file Word
                                </span>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Chọn file .docx hoặc .doc
                                </p>
                              </Label>
                              <Input
                                id="template-file"
                                ref={fileInputRef}
                                type="file"
                                accept=".doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        File Word template nên sử dụng các placeholder như {"{"}
                        {"{"}contract_number{"}"}
                        {"}"} để tự động điền dữ liệu. Sau khi tải lên, bạn có
                        thể tải xuống để chỉnh sửa bằng Word trước khi xác nhận.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isDraft && (
                    <span className="text-xs text-muted-foreground">
                      💾 Bản nháp đã được lưu tự động
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu bản nháp
                  </Button>
                </div>
                {/* Word Count */}
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <FileType className="h-3 w-3" />
                  <span>
                    {wordCount} từ, {charCount} ký tự
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  {template ? "Cập nhật" : "Tạo mẫu"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Find and Replace Dialog */}
      <Dialog open={showFindReplace} onOpenChange={setShowFindReplace}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tìm và thay thế</DialogTitle>
            <DialogDescription>
              Tìm và thay thế văn bản trong tài liệu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="find-text">Tìm:</Label>
              <Input
                id="find-text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Nhập văn bản cần tìm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    e.preventDefault();
                    handleReplace();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replace-text">Thay thế bằng:</Label>
              <Input
                id="replace-text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Nhập văn bản thay thế"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    e.preventDefault();
                    handleReplaceAll();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleFindNext}
              disabled={!findText}>
              <Search className="h-4 w-4 mr-2" />
              Tìm tiếp
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReplace}
              disabled={!findText || !replaceText}>
              <Replace className="h-4 w-4 mr-2" />
              Thay thế
            </Button>
            <Button
              type="button"
              onClick={handleReplaceAll}
              disabled={!findText || !replaceText}>
              <Replace className="h-4 w-4 mr-2" />
              Thay thế tất cả
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFindReplace(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
