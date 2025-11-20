import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs/promises";
import path from "path";

/**
 * Merge contract data into Word template using docxtemplater
 * Template should use placeholders like {contract_number}, {translator_name}, etc.
 */
export async function mergeWordTemplate(
  templatePath: string,
  contractData: any,
  work?: any,
  translator?: any
): Promise<Buffer> {
  // Read template file
  const templateBuffer = await fs.readFile(templatePath);

  // Load template
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Prepare data for template
  const data: any = {
    // Contract basic info
    contract_number: contractData.contract_number || "",
    contract_date: formatDate(contractData.start_date || new Date().toISOString()),

    // Work info
    work_name: work?.name || work?.title || contractData.work_name_input || "",

    // Translator info
    translator_name: translator?.full_name || contractData.translator_full_name || "",
    translator_id_card: translator?.id_card_number || contractData.translator_id_card || "",
    translator_address: translator?.address || contractData.translator_address || "",
    translator_phone: translator?.phone || contractData.translator_phone || "",
    translator_email: translator?.email || contractData.translator_email || "",
    translator_bank_account: translator?.bank_account_number || contractData.translator_bank_account || "",
    translator_bank_name: translator?.bank_name || contractData.translator_bank_name || "",
    translator_bank_branch: translator?.bank_branch || contractData.translator_bank_branch || "",
    translator_tax_code: translator?.tax_code || contractData.translator_tax_code || "",

    // Dates
    start_date: formatDate(contractData.start_date || ""),
    end_date: formatDate(contractData.end_date || ""),

    // Financial info - numbers
    base_page_count: String(contractData.base_page_count || 0),
    translation_unit_price: formatCurrency(contractData.translation_unit_price || 0),
    translation_cost: formatCurrency(contractData.translation_cost || 0),
    overview_writing_cost: formatCurrency(contractData.overview_writing_cost || 0),
    total_amount: formatCurrency(contractData.total_amount || 0),
    advance_payment_1_percent: String(contractData.advance_payment_1_percent || 0),
    advance_payment_1: formatCurrency(contractData.advance_payment_1 || 0),
    advance_payment_2_percent: String(contractData.advance_payment_2_percent || 0),
    advance_payment_2: formatCurrency(contractData.advance_payment_2 || 0),
    final_payment: formatCurrency(contractData.final_payment || 0),

    // Financial info - words
    translation_cost_words: numberToWords(contractData.translation_cost || 0),
    overview_writing_cost_words: numberToWords(contractData.overview_writing_cost || 0),
    total_amount_words: numberToWords(contractData.total_amount || 0),
    advance_payment_1_words: numberToWords(contractData.advance_payment_1 || 0),
    advance_payment_2_words: numberToWords(contractData.advance_payment_2 || 0),
    final_payment_words: numberToWords(contractData.final_payment || 0),
  };

  // Render document
  try {
    doc.render(data);
  } catch (error: any) {
    const e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    };
    throw new Error(`Error rendering template: ${JSON.stringify(e)}`);
  }

  // Generate buffer
  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buf;
}

function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return num.toLocaleString("vi-VN");
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
}

function numberToWords(num: number): string {
  // Simplified version - in production, use full Vietnamese number to words conversion
  if (num === 0) return "không";
  // TODO: Implement full Vietnamese number to words conversion
  // For now, return formatted number
  return num.toLocaleString("vi-VN");
}

