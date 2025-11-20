"use client";

import { useLocation } from "wouter";
import { ContractTemplateEditor } from "@/components/contracts/ContractTemplateEditor";
import { apiClient, ContractTemplate } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ContractTemplateEditorPage() {
  const [location, setLocation] = useLocation();
  
  // Extract template ID from URL query params
  const params = new URLSearchParams(window.location.search);
  const templateId = params.get("id");
  const isNew = !templateId;

  // Fetch template if editing
  const { data: template, isLoading } = useQuery<ContractTemplate>({
    queryKey: ["contractTemplate", templateId],
    queryFn: () => apiClient.getContractTemplate(parseInt(templateId!)),
    enabled: !!templateId && !isNew,
  });

  const handleSuccess = () => {
    // Navigate back to templates list
    setLocation("/contracts/templates");
  };

  const handleClose = () => {
    // Navigate back to templates list
    setLocation("/contracts/templates");
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ContractTemplateEditor
      template={template || null}
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
}

