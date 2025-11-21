import { ContractFormValues } from "@/components/contracts/ContractForm";
import { Work, Translator } from "./api";
import { formatCurrency, formatDate, numberToWords } from "./numberToWords";
import { formatVietnameseNumber } from "./utils";

/**
 * Merge contract data into template content
 * Replaces placeholders like {{contract_number}} with actual values
 */
/**
 * Merge contract data into template content
 * Replaces placeholders like {{contract_number}} with actual values
 * Preserves HTML formatting and structure
 */
export function mergeTemplateContent(
  templateContent: string,
  formData: ContractFormValues,
  work?: Work,
  translator?: Translator
): string {
  if (!templateContent) return "";
  
  // Create a copy to avoid mutating the original
  // Preserve all HTML structure, styles, and formatting
  let merged = String(templateContent);
  
  // Helper to safely replace placeholders without breaking HTML
  // Note: We don't escape HTML because placeholders are meant to be replaced with actual content
  // that may contain HTML formatting from the template editor
  const safeReplace = (pattern: RegExp, replacement: string | number | null | undefined) => {
    const safeReplacement = String(replacement || "").replace(/\$/g, "$$$$"); // Escape $ for regex
    merged = merged.replace(pattern, safeReplacement);
  };

  // Contract basic info
  safeReplace(/\{\{contract_number\}\}/g, formData.contract_number || "");
  safeReplace(/\{\{contract_date\}\}/g, formatDate(formData.start_date || new Date().toISOString()));

  // Work info - try multiple fields
  const workName = work?.name || work?.title || formData.work_name_input || "";
  safeReplace(/\{\{work_name\}\}/g, workName);

  // Translator info
  safeReplace(/\{\{translator_name\}\}/g, translator?.full_name || formData.translator_full_name || "");
  safeReplace(/\{\{translator_id_card\}\}/g, translator?.id_card_number || formData.translator_id_card || "");
  safeReplace(/\{\{translator_id_card_issue_date\}\}/g, translator?.id_card_issue_date ? formatDate(translator.id_card_issue_date) : "");
  safeReplace(/\{\{translator_id_card_issue_place\}\}/g, translator?.id_card_issue_place || "");
  safeReplace(/\{\{translator_workplace\}\}/g, translator?.workplace || "");
  safeReplace(/\{\{translator_address\}\}/g, translator?.address || formData.translator_address || "");
  safeReplace(/\{\{translator_phone\}\}/g, translator?.phone || formData.translator_phone || "");
  safeReplace(/\{\{translator_email\}\}/g, translator?.email || formData.translator_email || "");
  safeReplace(/\{\{translator_beneficiary\}\}/g, translator?.beneficiary || translator?.full_name || formData.translator_full_name || "");
  safeReplace(/\{\{translator_bank_account\}\}/g, translator?.bank_account_number || formData.translator_bank_account || "");
  safeReplace(/\{\{translator_bank_name\}\}/g, translator?.bank_name || formData.translator_bank_name || "");
  safeReplace(/\{\{translator_bank_branch\}\}/g, translator?.bank_branch || formData.translator_bank_branch || "");
  safeReplace(/\{\{translator_tax_code\}\}/g, translator?.tax_code || formData.translator_tax_code || "");

  // Dates
  safeReplace(/\{\{start_date\}\}/g, formatDate(formData.start_date || ""));
  safeReplace(/\{\{end_date\}\}/g, formatDate(formData.end_date || ""));

  // Financial info - numbers
  safeReplace(/\{\{base_page_count\}\}/g, formatVietnameseNumber(formData.base_page_count || 0));
  safeReplace(/\{\{translation_unit_price\}\}/g, formatCurrency(formData.translation_unit_price || 0));
  safeReplace(/\{\{translation_cost\}\}/g, formatCurrency(formData.translation_cost || 0));
  safeReplace(/\{\{overview_writing_cost\}\}/g, formatCurrency(formData.overview_writing_cost || 0));
  safeReplace(/\{\{total_amount\}\}/g, formatCurrency(formData.total_amount || 0));
  safeReplace(/\{\{advance_payment_1_percent\}\}/g, String(formData.advance_payment_1_percent || 0));
  safeReplace(/\{\{advance_payment_1\}\}/g, formatCurrency(formData.advance_payment_1 || 0));
  safeReplace(/\{\{advance_payment_2_percent\}\}/g, String(formData.advance_payment_2_percent || 0));
  safeReplace(/\{\{advance_payment_2\}\}/g, formatCurrency(formData.advance_payment_2 || 0));
  safeReplace(/\{\{final_payment\}\}/g, formatCurrency(formData.final_payment || 0));

  // Financial info - words
  safeReplace(/\{\{translation_cost_words\}\}/g, numberToWords(formData.translation_cost || 0));
  safeReplace(/\{\{overview_writing_cost_words\}\}/g, numberToWords(formData.overview_writing_cost || 0));
  safeReplace(/\{\{total_amount_words\}\}/g, numberToWords(formData.total_amount || 0));
  safeReplace(/\{\{advance_payment_1_words\}\}/g, numberToWords(formData.advance_payment_1 || 0));
  safeReplace(/\{\{advance_payment_2_words\}\}/g, numberToWords(formData.advance_payment_2 || 0));
  safeReplace(/\{\{final_payment_words\}\}/g, numberToWords(formData.final_payment || 0));

  return merged;
}

/**
 * Generate Word document from template
 * This would need to be implemented on the backend or using docxtemplater
 */
export async function generateWordFromTemplate(
  templateFile: Blob | File,
  formData: ContractFormValues,
  work?: Work,
  translator?: Translator
): Promise<Blob> {
  // This would use docxtemplater or similar library
  // For now, return the template file as-is
  // In production, this should merge the data into the Word document
  return templateFile instanceof File ? templateFile : new Blob([templateFile]);
}

