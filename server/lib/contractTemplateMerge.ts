/**
 * Merge contract data into template content
 * This is a server-side version of the merge function
 */

export function mergeTemplateContent(
  templateContent: string,
  contractData: any,
  work?: any,
  translator?: any
): string {
  let merged = templateContent;

  // Helper functions for formatting
  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) return "0";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "0";
    return num.toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const numberToWords = (num: number): string => {
    // Simplified version - in production, use full Vietnamese number to words conversion
    if (num === 0) return "không";
    // TODO: Implement full Vietnamese number to words conversion
    return num.toString();
  };

  // Contract basic info
  merged = merged.replace(/\{\{contract_number\}\}/g, contractData.contract_number || "");
  merged = merged.replace(/\{\{contract_date\}\}/g, formatDate(contractData.start_date || new Date().toISOString()));

  // Work info
  merged = merged.replace(/\{\{work_name\}\}/g, work?.name || work?.title || contractData.work_name_input || "");

  // Translator info
  merged = merged.replace(/\{\{translator_name\}\}/g, translator?.full_name || contractData.translator_full_name || "");
  merged = merged.replace(/\{\{translator_id_card\}\}/g, translator?.id_card_number || contractData.translator_id_card || "");
  merged = merged.replace(/\{\{translator_address\}\}/g, translator?.address || contractData.translator_address || "");
  merged = merged.replace(/\{\{translator_phone\}\}/g, translator?.phone || contractData.translator_phone || "");
  merged = merged.replace(/\{\{translator_email\}\}/g, translator?.email || contractData.translator_email || "");
  merged = merged.replace(/\{\{translator_bank_account\}\}/g, translator?.bank_account_number || contractData.translator_bank_account || "");
  merged = merged.replace(/\{\{translator_bank_name\}\}/g, translator?.bank_name || contractData.translator_bank_name || "");
  merged = merged.replace(/\{\{translator_bank_branch\}\}/g, translator?.bank_branch || contractData.translator_bank_branch || "");
  merged = merged.replace(/\{\{translator_tax_code\}\}/g, translator?.tax_code || contractData.translator_tax_code || "");

  // Dates
  merged = merged.replace(/\{\{start_date\}\}/g, formatDate(contractData.start_date || ""));
  merged = merged.replace(/\{\{end_date\}\}/g, formatDate(contractData.end_date || ""));

  // Financial info - numbers
  merged = merged.replace(/\{\{base_page_count\}\}/g, String(contractData.base_page_count || 0));
  merged = merged.replace(/\{\{translation_unit_price\}\}/g, formatCurrency(contractData.translation_unit_price || 0));
  merged = merged.replace(/\{\{translation_cost\}\}/g, formatCurrency(contractData.translation_cost || 0));
  merged = merged.replace(/\{\{overview_writing_cost\}\}/g, formatCurrency(contractData.overview_writing_cost || 0));
  merged = merged.replace(/\{\{total_amount\}\}/g, formatCurrency(contractData.total_amount || 0));
  merged = merged.replace(/\{\{advance_payment_1_percent\}\}/g, String(contractData.advance_payment_1_percent || 0));
  merged = merged.replace(/\{\{advance_payment_1\}\}/g, formatCurrency(contractData.advance_payment_1 || 0));
  merged = merged.replace(/\{\{advance_payment_2_percent\}\}/g, String(contractData.advance_payment_2_percent || 0));
  merged = merged.replace(/\{\{advance_payment_2\}\}/g, formatCurrency(contractData.advance_payment_2 || 0));
  merged = merged.replace(/\{\{final_payment\}\}/g, formatCurrency(contractData.final_payment || 0));

  // Financial info - words
  merged = merged.replace(/\{\{translation_cost_words\}\}/g, numberToWords(contractData.translation_cost || 0));
  merged = merged.replace(/\{\{overview_writing_cost_words\}\}/g, numberToWords(contractData.overview_writing_cost || 0));
  merged = merged.replace(/\{\{total_amount_words\}\}/g, numberToWords(contractData.total_amount || 0));
  merged = merged.replace(/\{\{advance_payment_1_words\}\}/g, numberToWords(contractData.advance_payment_1 || 0));
  merged = merged.replace(/\{\{advance_payment_2_words\}\}/g, numberToWords(contractData.advance_payment_2 || 0));
  merged = merged.replace(/\{\{final_payment_words\}\}/g, numberToWords(contractData.final_payment || 0));

  return merged;
}

