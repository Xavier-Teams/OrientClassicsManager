"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, FileText, FileDown } from "lucide-react";
import { ContractFormValues, Work, Translator } from "@/lib/api";
import { numberToWords, formatCurrency, formatDate } from "@/lib/numberToWords";
import { generateWordContract, generatePDFContract } from "@/lib/contractGenerator";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ContractPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ContractFormValues;
  work?: Work;
  translator?: Translator;
}

export function ContractPreview({
  open,
  onOpenChange,
  formData,
  work,
  translator,
}: ContractPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Hợp đồng dịch thuật</title>
              <style>
                body {
                  font-family: "Times New Roman", serif;
                  font-size: 13pt;
                  line-height: 1.6;
                  margin: 40px;
                  color: #000;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 20px;
                }
                .header-left {
                  width: 45%;
                }
                .header-right {
                  width: 45%;
                  text-align: right;
                }
                h1 {
                  text-align: center;
                  font-size: 16pt;
                  font-weight: bold;
                  margin: 20px 0;
                }
                h2 {
                  text-align: center;
                  font-size: 14pt;
                  font-weight: bold;
                  margin: 15px 0;
                }
                .underline {
                  text-decoration: underline;
                }
                .section {
                  margin: 15px 0;
                }
                .section-title {
                  font-weight: bold;
                  margin-top: 15px;
                }
                .info-grid {
                  margin: 10px 0;
                }
                .info-item {
                  margin: 5px 0;
                }
                .signature-section {
                  display: flex;
                  justify-content: space-between;
                  margin-top: 50px;
                }
                .signature-box {
                  width: 45%;
                  text-align: center;
                }
                @media print {
                  body {
                    margin: 20px;
                  }
                  .no-print {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handleDownloadHTML = () => {
    if (printRef.current) {
      const htmlContent = printRef.current.innerHTML;
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Hợp đồng dịch thuật - ${formData.contract_number}</title>
            <style>
              body {
                font-family: "Times New Roman", serif;
                font-size: 13pt;
                line-height: 1.6;
                margin: 40px;
                color: #000;
              }
              .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .header-left {
                width: 45%;
              }
              .header-right {
                width: 45%;
                text-align: right;
              }
              h1 {
                text-align: center;
                font-size: 16pt;
                font-weight: bold;
                margin: 20px 0;
              }
              h2 {
                text-align: center;
                font-size: 14pt;
                font-weight: bold;
                margin: 15px 0;
              }
              .underline {
                text-decoration: underline;
              }
              .section {
                margin: 15px 0;
              }
              .section-title {
                font-weight: bold;
                margin-top: 15px;
              }
              .info-grid {
                margin: 10px 0;
              }
              .info-item {
                margin: 5px 0;
              }
              .signature-section {
                display: flex;
                justify-content: space-between;
                margin-top: 50px;
              }
              .signature-box {
                width: 45%;
                text-align: center;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Hop-dong-${formData.contract_number}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadWord = async () => {
    if (!work || !translator) {
      toast({
        title: "Lỗi",
        description: "Thiếu thông tin tác phẩm hoặc dịch giả",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      await generateWordContract(formData, work, translator);
      toast({
        title: "Thành công",
        description: "Đã tải xuống file Word",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo file Word",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy nội dung hợp đồng",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      // Set ID for the element
      printRef.current.id = "contract-content";
      await generatePDFContract("contract-content", `Hop-dong-${formData.contract_number}`);
      toast({
        title: "Thành công",
        description: "Đã tải xuống file PDF",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo file PDF",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const today = new Date();
  const contractDateStr = formData.start_date || today.toISOString().split("T")[0];
  const contractDate = formatDate(contractDateStr);
  
  // Tính số tháng từ start_date đến end_date
  const startDate = formData.start_date ? new Date(formData.start_date) : new Date();
  const endDate = formData.end_date ? new Date(formData.end_date) : new Date();
  const daysDiff = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const monthsDiff = Math.round(daysDiff / 30);

  // Tính các khoản thanh toán
  const translationCost = formData.translation_cost || 0;
  const overviewCost = formData.overview_writing_cost || 0;
  const totalAmount = formData.total_amount || 0;
  const advance1Percent = formData.advance_payment_1_percent || 0;
  const advance2Percent = formData.advance_payment_2_percent || 0;
  const advance1Amount = formData.advance_payment_1 || 0;
  const advance2Amount = formData.advance_payment_2 || 0;
  const finalAmount = formData.final_payment || 0;
  const managementFee = formData.management_fee || 0;
  const taxAmount = formData.tax_amount || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xem trước hợp đồng</DialogTitle>
        </DialogHeader>

        <div className="no-print flex gap-2 mb-4 flex-wrap">
          <Button onClick={handlePrint} variant="outline" disabled={isGenerating}>
            <Printer className="h-4 w-4 mr-2" />
            In hợp đồng
          </Button>
          <Button onClick={handleDownloadHTML} variant="outline" disabled={isGenerating}>
            <Download className="h-4 w-4 mr-2" />
            Tải xuống HTML
          </Button>
          <Button onClick={handleDownloadWord} variant="outline" disabled={isGenerating || !work || !translator}>
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? "Đang tạo..." : "Tải xuống Word (.docx)"}
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" disabled={isGenerating}>
            <FileDown className="h-4 w-4 mr-2" />
            {isGenerating ? "Đang tạo..." : "Tải xuống PDF"}
          </Button>
        </div>

        <div ref={printRef} className="contract-content">
          <div className="header">
            <div className="header-left">
              <div><strong>VIỆN TRẦN NHÂN TÔNG</strong></div>
              <div><strong>DỰ ÁN KINH ĐIỂN</strong></div>
              <div><strong>PHƯƠNG ĐÔNG</strong></div>
            </div>
            <div className="header-right">
              <div><strong>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></div>
              <div><strong>Độc lập - Tự do - Hạnh phúc</strong></div>
              <div style={{ fontStyle: "italic" }}>{contractDate}</div>
              <div>Số: {formData.contract_number || "/HĐ-VPKĐ"}</div>
            </div>
          </div>

          <h1>HỢP ĐỒNG DỊCH THUẬT</h1>
          <h2>HỢP PHẦN PHẬT TẠNG TINH YẾU</h2>

          <div className="section">
            <p>
              <em>- Căn cứ Luật Dân sự của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam;</em>
            </p>
            <p>
              <em>- Căn cứ Quyết định số 888/QĐ-ĐHQGHN ngày 28/03/2019 của Giám đốc ĐHQGHN về việc phê duyệt dự án KH&CN do Thủ tướng Chính phủ giao;</em>
            </p>
            <p>
              <em>- Căn cứ Quyết định số 889/QĐ-ĐHQGHN ngày 23/8/2019 của Giám đốc ĐHQGHN về việc thành lập Văn phòng Dự án Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông;</em>
            </p>
            <p>
              <em>- Căn cứ Quyết định số 3668/QĐ-ĐHQGHN ngày 19/11/2019 về việc ban hành Quy chế tổ chức và hoạt động của Dự án khoa học và công nghệ "Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông";</em>
            </p>
            <p>
              <em>- Căn cứ Thông tư 55/2015/TTLT-BTC-BKHCN ngày 22/4/2015 về việc hướng dẫn định mức xây dựng, phân bổ dự toán và quyết toán kinh phí đối với nhiệm vụ khoa học và công nghệ có sử dụng ngân sách nhà nước;</em>
            </p>
            <p>
              <em>- Căn cứ Quyết định số 16/QĐ-VTNT ngày 16/01/2020 về việc ban hành Quy chế chi tiêu nội bộ của Dự án khoa học và công nghệ "Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông";</em>
            </p>
            <p>
              <em>- Căn cứ Giấy ủy quyền số 15/GUQ-VPKĐ ngày 01/09/2020 của Chủ nhiệm Dự án cho Chánh Văn phòng Dự án;</em>
            </p>
            <p>
              <em>- Căn cứ Quyết định số 14/QĐ-VPKĐ ngày 08/05/2023 về việc ký các hợp đồng dịch thuật Hợp phần Phật tạng tinh yếu giai đoạn 3;</em>
            </p>
            <p>
              <em>- Căn cứ vào khả năng và nhu cầu của hai bên.</em>
            </p>
          </div>

          <div className="section">
            <p><strong>Chúng tôi gồm:</strong></p>
            
            <p>
              <strong><span className="underline">Bên giao (Bên A)</span>: Văn phòng Dự án Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông (gọi tắt là "Dự án")</strong>
            </p>
            
            <div className="info-grid">
              <div className="info-item"><strong>Đại diện và thừa ủy quyền của Chủ nhiệm Dự án:</strong> Bà Đào Thị Tâm Khánh</div>
              <div className="info-item"><strong>Chức vụ:</strong> Chánh Văn phòng</div>
              <div className="info-item"><strong>Địa chỉ:</strong> Số 144 Xuân Thủy, Cầu Giấy, Hà Nội</div>
              <div className="info-item"><strong>Điện thoại:</strong> 02462666889</div>
              <div className="info-item"><strong>Số tài khoản:</strong> 2601183714</div>
              <div className="info-item"><strong>Tại:</strong> Ngân hàng TMCP Đầu Tư và Phát triển Việt Nam (BIDV) CN Mỹ Đình</div>
              <div className="info-item"><strong>Mã số thuế:</strong> 0107762297 - 001</div>
            </div>

            <p style={{ marginTop: "15px" }}>
              <strong>Bên nhận (Bên B): {translator?.full_name || formData.translator_full_name || "[Tên dịch giả]"}</strong>
            </p>
            
            <div className="info-grid">
              <div className="info-item">
                <strong>Số CMT:</strong> {formData.translator_id_card || translator?.id_card_number || "[Số CMND/CCCD]"}
                {translator?.id_card_issue_date && ` Ngày cấp: ${formatDate(translator.id_card_issue_date)}`}
              </div>
              {translator?.id_card_issue_place && (
                <div className="info-item"><strong>Nơi cấp:</strong> {translator.id_card_issue_place}</div>
              )}
              {translator?.workplace && (
                <div className="info-item"><strong>Nơi công tác:</strong> {translator.workplace}</div>
              )}
              <div className="info-item"><strong>Địa chỉ:</strong> {formData.translator_address || translator?.address || "[Địa chỉ]"}</div>
              <div className="info-item"><strong>Điện thoại:</strong> {formData.translator_phone || translator?.phone || "[Số điện thoại]"}</div>
              <div className="info-item"><strong>Email:</strong> {formData.translator_email || translator?.email || "[Email]"}</div>
              <div className="info-item"><strong>Người thụ hưởng:</strong> {translator?.full_name || formData.translator_full_name || "[Tên dịch giả]"}</div>
              <div className="info-item"><strong>Số tài khoản:</strong> {formData.translator_bank_account || translator?.bank_account_number || "[Số tài khoản]"}</div>
              <div className="info-item"><strong>Tại ngân hàng:</strong> {formData.translator_bank_name || translator?.bank_name || "[Tên ngân hàng]"}</div>
              {formData.translator_bank_branch || translator?.bank_branch ? (
                <div className="info-item"><strong>Chi nhánh:</strong> {formData.translator_bank_branch || translator?.bank_branch}</div>
              ) : null}
              <div className="info-item"><strong>Mã số thuế TNCN:</strong> {formData.translator_tax_code || translator?.tax_code || "[Mã số thuế TNCN]"}</div>
            </div>
          </div>

          <div className="section">
            <p>
              <strong>Hai bên thỏa thuận kí kết Hợp đồng dịch thuật hợp phần Phật tạng tinh yếu (<em>sau đây gọi tắt là "Hợp đồng"</em>) với những điều khoản sau:</strong>
            </p>
          </div>

          <div className="section">
            <p className="section-title">Điều 1:</p>
            <p>
              Bên B cam kết thực hiện việc toàn dịch và chú giải (sau đây gọi tắt là "dịch thuật") cho Bên A toàn bộ tài liệu <em>{work?.name || "[Tên tác phẩm]"}</em> từ {work?.source_language || "[Ngôn ngữ nguồn]"} sang {work?.target_language || "[Ngôn ngữ đích]"} theo thỏa thuận được quy định cụ thể trong Hợp đồng này.
            </p>
            <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
              <li><strong>Tên tài liệu:</strong> <em>{work?.name || "[Tên tác phẩm]"}</em></li>
              <li><strong>Ngôn ngữ gốc:</strong> {work?.source_language || "[Ngôn ngữ nguồn]"}</li>
              <li><strong>Tổng số trang tài liệu quy đổi cần thực hiện dịch thuật (tạm tính):</strong> {formatCurrency(formData.base_page_count || 0)} trang (350 chữ/1 trang)</li>
              <li><strong>Nội dung công việc cụ thể bao gồm:</strong>
                <ol style={{ marginLeft: "20px" }}>
                  <li>Toàn dịch, chú giải và chú thích;</li>
                  <li>Viết bài giới thiệu tổng quan.</li>
                </ol>
              </li>
            </ul>
          </div>

          <div className="section">
            <p className="section-title">Điều 2: Thời gian và kinh phí thực hiện Hợp đồng</p>
            
            <p><strong>2.1. Thời gian thực hiện Hợp đồng:</strong></p>
            <ul style={{ marginLeft: "20px" }}>
              <li><strong>Tổng thời gian thực hiện Hợp đồng:</strong> {monthsDiff} tháng kể từ {formatDate(formData.start_date || "")}</li>
              <li><strong>Thời gian giao nộp sản phẩm cuối cùng:</strong> hết {formatDate(formData.end_date || "")}</li>
            </ul>

            <p style={{ marginTop: "15px" }}><strong>2.2. Kinh phí thực hiện Hợp đồng:</strong></p>
            <ul style={{ marginLeft: "20px" }}>
              <li>
                <strong>Tổng kinh phí khái toán thực hiện Hợp đồng là:</strong> {formatCurrency(totalAmount)} đồng (Bằng chữ: <em>{numberToWords(totalAmount)}</em>). Trong đó:
                <ul style={{ marginLeft: "20px" }}>
                  <li>
                    Kinh phí phiên dịch, chú giải, chú thích: {formatCurrency(formData.base_page_count || 0)} trang quy đổi × {formatCurrency(formData.translation_unit_price || 0)} đ/trang = {formatCurrency(translationCost)} đồng (Bằng chữ: <em>{numberToWords(translationCost)}</em>);
                  </li>
                  {overviewCost > 0 && (
                    <li>
                      Kinh phí viết "Bài khảo sát tổng quan" cho tài liệu trong Điều 1 của Hợp đồng này là: {formatCurrency(overviewCost)} đồng (Bằng chữ: <em>{numberToWords(overviewCost)}</em>). Kinh phí này sẽ được thanh toán sau khi được Hội đồng nghiệm thu tài liệu dịch thuật do Bên A tổ chức công nhận là đạt chất lượng.
                    </li>
                  )}
                </ul>
              </li>
              <li>Tổng kinh phí cuối cùng của Hợp đồng căn cứ vào tổng số chữ thực tế của sản phẩm giao nộp cuối cùng đã được Hội đồng nghiệm thu tài liệu dịch thuật do Bên A tổ chức công nhận là đạt chất lượng theo yêu cầu (Không bao gồm phần nguyên văn chữ Hán và phần phiên âm).</li>
              <li>Kinh phí này đã bao gồm những khoản đóng góp nghĩa vụ cho ngân sách Nhà nước theo quy định của pháp luật và theo quy định của Dự án.</li>
              <li>
                Tổng số kinh phí khái toán này Bên A sẽ chuyển vào tài khoản của Bên B theo nội dung và tiến độ như sau:
                <ul style={{ marginLeft: "20px" }}>
                  {advance1Percent > 0 && (
                    <li>
                      <strong>Đợt 1:</strong> Bên A sẽ tạm ứng cho Bên B {advance1Percent}% tổng kinh phí phiên dịch, chú giải, chú thích ngay sau khi kí Hợp đồng tương ứng số tiền là: {formatCurrency(advance1Amount)} đồng (Bằng chữ: <em>{numberToWords(advance1Amount)}</em>);
                    </li>
                  )}
                  {advance2Percent > 0 && (
                    <li>
                      <strong>Đợt 2:</strong> Bên A sẽ thanh toán cho Bên B số tiền {advance2Percent}% tổng kinh phí phiên dịch, chú giải, chú thích sau khi Bên A kiểm tra tiến độ và Bên B đạt đủ điều kiện hoàn thành ít nhất 50% khối lượng sản phẩm của hợp đồng, tương ứng số tiền là: {formatCurrency(advance2Amount)} đồng (Bằng chữ: <em>{numberToWords(advance2Amount)}</em>);
                    </li>
                  )}
                  <li>
                    <strong>Đợt 3:</strong> Bên A sẽ thanh toán cho Bên B số tiền còn lại của Hợp đồng (căn cứ trên tổng kinh phí cuối cùng của Hợp đồng đã khấu trừ các khoản đóng góp nghĩa vụ và bao gồm kinh phí viết bài khảo sát tổng quan theo quy định của Dự án) sau khi bên B giao nộp sản phẩm hoàn chỉnh và nghiệm thu, thanh lí Hợp đồng. Đối với trường hợp bên B không hoàn thành được "Bài khảo sát tổng quan" theo yêu cầu của hội đồng nghiệm thu thì bên A sẽ giữ lại phần kinh phí này;
                  </li>
                  <li>Bên A sẽ khấu trừ phí quản lí hợp đồng có giá trị 5% trên tổng kinh phí cuối cùng của hợp đồng và thực hiện khấu trừ theo từng lần thanh toán.</li>
                  <li>Bên A sẽ khấu trừ 10% của tổng kinh phí chuyên môn thực nhận (không bao gồm 5% phí quản lí) của Hợp đồng, theo từng lần thanh toán để thực hiện nghĩa vụ thuế thu nhập cá nhân theo quy định của pháp luật.</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="section">
            <p className="section-title">Điều 3: Quyền và trách nhiệm của bên B</p>
            <p><strong>3.1.</strong> Bên B cam kết đảm bảo bản toàn dịch, chú giải và chú thích (sau đây gọi tắt là "bản dịch") đạt chất lượng, đầy đủ, chính xác, đúng nội dung bản gốc và tuân thủ theo yêu cầu của bản "Thể lệ dịch thuật Phật tạng tinh yếu" do Dự án ban hành. Sản phẩm cuối cùng Bên B giao nộp cho Bên A phải được Hội đồng nghiệm thu tài liệu dịch thuật do Bên A tổ chức công nhận là đạt chất lượng theo yêu cầu, bao gồm:</p>
            <ul style={{ marginLeft: "20px" }}>
              <li>Bản toàn dịch, chú giải và chú thích.</li>
              <li>01 bài khảo sát tổng quan về sản phẩm thực hiện theo mẫu và đạt yêu cầu của Dự án, dung lượng từ 8.000 chữ đến 15.000 chữ.</li>
            </ul>
            <p><strong>3.2.</strong> Bên B cam kết tự tiến hành dịch toàn bộ phần được yêu cầu dịch đã thỏa thuận trong Điều 1 và không chuyển cho bất kì bên thứ ba nào khác dịch thay.</p>
            <p><strong>3.3.</strong> Bên B cam kết đảm bảo hoàn thành và giao nộp bản dịch theo chất lượng được yêu cầu và thời gian nêu trong hợp đồng.</p>
            <p><strong>3.4.</strong> Bên B có trách nhiệm cộng tác chặt chẽ với Bên A để sửa chữa, hoàn thiện bản dịch theo tiến độ thời gian và yêu cầu chất lượng cụ thể của Bên A.</p>
            <p><strong>3.5.</strong> Nếu bản dịch của Bên B được Hội đồng nghiệm thu do Bên A tổ chức đánh giá là đạt chất lượng tốt, hoàn thiện và có thể xuất bản được ngay, thì Bên A sẽ xem xét thanh toán kinh phí hiệu đính cho bên B căn cứ theo nội dung, khối lượng thực hiện cụ thể và theo Quy chế của Dự án.</p>
          </div>

          <div className="section">
            <p className="section-title">Điều 4: Quyền và trách nhiệm của Bên A</p>
            <p><strong>4.1.</strong> Bên A cam kết cấp kinh phí cho Bên B theo đúng tiến độ thực hiện như quy định tại Điều 2 của Hợp đồng này.</p>
            <p><strong>4.2.</strong> Bên A có trách nhiệm tổ chức đánh giá tiến độ thực hiện và nghiệm thu bản dịch theo quy định hiện hành.</p>
            <p><strong>4.3.</strong> Bên A giữ toàn quyền biên tập bản dịch và có quyền yêu cầu Bên B tiến hành sửa chữa, hoàn thiện bản dịch cho đến khi đạt chất lượng được quy định cụ thể theo bản "Thể lệ dịch thuật Phật tạng tinh yếu" do Dự án ban hành.</p>
          </div>

          <div className="section">
            <p className="section-title">Điều 5: Bản quyền và quyền sở hữu trí tuệ</p>
            <p><strong>5.1.</strong> Bản quyền đối với bản dịch do Bên B thực hiện thuộc về Bên A. Bên A nắm quyền sở hữu bản dịch, độc quyền khai thác, phát hành bản dịch dưới mọi hình thức, trên mọi phương tiện theo thời hạn Hợp đồng độc quyền kí với bên B, hoặc không thời hạn đối với tác phẩm hết thời hạn bảo hộ theo quy định của Công ước Berne và pháp luật Việt Nam tại thời điểm kí kết Hợp đồng này.</p>
            <p><strong>5.2.</strong> Quyền lợi khi xuất bản:</p>
            <ul style={{ marginLeft: "20px" }}>
              <li>Bên A: ghi tên: "Dự án Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông (Viện Trần Nhân Tông, Đại học Quốc gia Hà Nội)"; Chủ nhiệm Dự án đứng tên Tổng chủ biên; ghi tên Hội đồng biên tập; ghi tên nhà tài trợ cho việc dịch thuật và in ấn.</li>
              <li>Bên B được đứng tên thật hoặc bút danh trong phần "Người dịch".</li>
              <li>Ghi tên Người hiệu đính (nếu có).</li>
              <li>Ghi các thông tin xuất bản khác theo quy định.</li>
            </ul>
            <p><strong>5.3.</strong> Trong mọi trường hợp, Bên B cam kết không phát tán hay chuyển bản dịch cho bất kì bên thứ ba nào khác mà không được sự cho phép của Bên A. Nếu vi phạm, Bên B sẽ phải đền bù thiệt hại tương ứng cho Bên A theo quy định của pháp luật.</p>
          </div>

          <div className="section">
            <p className="section-title">Điều 6: Điều khoản thi hành</p>
            <p><strong>6.1.</strong> Hai bên cam kết thực hiện đúng các điều khoản đã được ghi trong hợp đồng, bên nào vi phạm sẽ phải chịu hoàn toàn trách nhiệm theo các quy định hiện hành. Trong quá trình thực hiện hợp đồng, hai bên phải thông báo cho nhau những vấn đề nảy sinh và cùng nhau bàn bạc giải quyết.</p>
            <p><strong>6.2.</strong> Hợp đồng này có hiệu lực kể từ ngày kí. Hợp đồng được làm thành 05 bản có giá trị pháp lí như nhau, Bên B giữ 01 bản, Bên A giữ 04 bản (01 bản lưu BCN Dự án, 01 bản lưu Văn thư, 01 bản lưu tại bộ phận Kế toán, 01 bản lưu tại Ban Thư kí Dự án)./.</p>
          </div>

          <div className="signature-section">
            <div className="signature-box">
              <p><strong>BÊN A</strong></p>
              <p><strong>CHÁNH VĂN PHÒNG</strong></p>
              <p style={{ marginTop: "50px" }}><em>(Kí, đóng dấu)</em></p>
              <p style={{ marginTop: "30px" }}><strong>Đào Thị Tâm Khánh</strong></p>
            </div>
            <div className="signature-box">
              <p><strong>BÊN B</strong></p>
              <p style={{ marginTop: "20px" }}><em>(Kí, ghi rõ họ tên)</em></p>
              <p style={{ marginTop: "50px" }}><strong>{translator?.full_name || formData.translator_full_name || "[Tên dịch giả]"}</strong></p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

