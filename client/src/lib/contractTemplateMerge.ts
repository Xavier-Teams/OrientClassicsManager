import { ContractFormValues } from "@/components/contracts/ContractForm";
import { Work, Translator } from "./api";
import { formatCurrency, formatDate, numberToWords } from "./numberToWords";
import { formatVietnameseNumber } from "./utils";

/**
 * Merge contract data into template content
 * Replaces placeholders like {{contract_number}} with actual values
 */
export function mergeTemplateContent(
  templateContent: string,
  formData: ContractFormValues,
  work?: Work,
  translator?: Translator
): string {
  let merged = templateContent;

  // Contract basic info
  merged = merged.replace(/\{\{contract_number\}\}/g, formData.contract_number || "");
  merged = merged.replace(/\{\{contract_date\}\}/g, formatDate(formData.start_date || new Date().toISOString()));

  // Work info
  merged = merged.replace(/\{\{work_name\}\}/g, work?.title || formData.work_name_input || "");

  // Translator info
  merged = merged.replace(/\{\{translator_name\}\}/g, translator?.full_name || formData.translator_full_name || "");
  merged = merged.replace(/\{\{translator_id_card\}\}/g, translator?.id_card_number || formData.translator_id_card || "");
  merged = merged.replace(/\{\{translator_address\}\}/g, translator?.address || formData.translator_address || "");
  merged = merged.replace(/\{\{translator_phone\}\}/g, translator?.phone || formData.translator_phone || "");
  merged = merged.replace(/\{\{translator_email\}\}/g, translator?.email || formData.translator_email || "");
  merged = merged.replace(/\{\{translator_bank_account\}\}/g, translator?.bank_account_number || formData.translator_bank_account || "");
  merged = merged.replace(/\{\{translator_bank_name\}\}/g, translator?.bank_name || formData.translator_bank_name || "");
  merged = merged.replace(/\{\{translator_bank_branch\}\}/g, translator?.bank_branch || formData.translator_bank_branch || "");
  merged = merged.replace(/\{\{translator_tax_code\}\}/g, translator?.tax_code || formData.translator_tax_code || "");

  // Dates
  merged = merged.replace(/\{\{start_date\}\}/g, formatDate(formData.start_date || ""));
  merged = merged.replace(/\{\{end_date\}\}/g, formatDate(formData.end_date || ""));

  // Financial info - numbers
  merged = merged.replace(/\{\{base_page_count\}\}/g, formatVietnameseNumber(formData.base_page_count || 0));
  merged = merged.replace(/\{\{translation_unit_price\}\}/g, formatCurrency(formData.translation_unit_price || 0));
  merged = merged.replace(/\{\{translation_cost\}\}/g, formatCurrency(formData.translation_cost || 0));
  merged = merged.replace(/\{\{overview_writing_cost\}\}/g, formatCurrency(formData.overview_writing_cost || 0));
  merged = merged.replace(/\{\{total_amount\}\}/g, formatCurrency(formData.total_amount || 0));
  merged = merged.replace(/\{\{advance_payment_1_percent\}\}/g, String(formData.advance_payment_1_percent || 0));
  merged = merged.replace(/\{\{advance_payment_1\}\}/g, formatCurrency(formData.advance_payment_1 || 0));
  merged = merged.replace(/\{\{advance_payment_2_percent\}\}/g, String(formData.advance_payment_2_percent || 0));
  merged = merged.replace(/\{\{advance_payment_2\}\}/g, formatCurrency(formData.advance_payment_2 || 0));
  merged = merged.replace(/\{\{final_payment\}\}/g, formatCurrency(formData.final_payment || 0));

  // Financial info - words
  merged = merged.replace(/\{\{translation_cost_words\}\}/g, numberToWords(formData.translation_cost || 0));
  merged = merged.replace(/\{\{overview_writing_cost_words\}\}/g, numberToWords(formData.overview_writing_cost || 0));
  merged = merged.replace(/\{\{total_amount_words\}\}/g, numberToWords(formData.total_amount || 0));
  merged = merged.replace(/\{\{advance_payment_1_words\}\}/g, numberToWords(formData.advance_payment_1 || 0));
  merged = merged.replace(/\{\{advance_payment_2_words\}\}/g, numberToWords(formData.advance_payment_2 || 0));
  merged = merged.replace(/\{\{final_payment_words\}\}/g, numberToWords(formData.final_payment || 0));

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

