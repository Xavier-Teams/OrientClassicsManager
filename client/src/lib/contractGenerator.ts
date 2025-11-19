import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ContractFormValues, Work, Translator } from "@/lib/api";
import { numberToWords, formatCurrency, formatDate } from "./numberToWords";

export async function generateWordContract(
  formData: ContractFormValues,
  work?: Work,
  translator?: Translator
): Promise<void> {
  const today = new Date();
  const contractDateStr = formData.start_date || today.toISOString().split("T")[0];
  const contractDate = formatDate(contractDateStr);

  // Tính số tháng
  const startDate = formData.start_date ? new Date(formData.start_date) : new Date();
  const endDate = formData.end_date ? new Date(formData.end_date) : new Date();
  const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const monthsDiff = Math.round(daysDiff / 30);

  // Tính các khoản thanh toán
  const translationCost = formData.translation_cost || 0;
  const overviewCost = formData.overview_writing_cost || 0;
  const totalAmount = formData.total_amount || 0;
  const advance1Percent = formData.advance_payment_1_percent || 0;
  const advance2Percent = formData.advance_payment_2_percent || 0;
  const advance1Amount = formData.advance_payment_1 || 0;
  const advance2Amount = formData.advance_payment_2 || 0;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({
                text: "VIỆN TRẦN NHÂN TÔNG",
                bold: true,
              }),
            ],
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "DỰ ÁN KINH ĐIỂN PHƯƠNG ĐÔNG",
                bold: true,
              }),
            ],
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                bold: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Độc lập - Tự do - Hạnh phúc",
                bold: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: contractDate,
                italics: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Số: ${formData.contract_number || "/HĐ-VPKĐ"}`,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: "" }),

          // Title
          new Paragraph({
            text: "HỢP ĐỒNG DỊCH THUẬT",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "HỢP PHẦN PHẬT TẠNG TINH YẾU",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),

          // Căn cứ
          new Paragraph({
            children: [
              new TextRun({
                text: "- Căn cứ Luật Dân sự của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam;",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Căn cứ Quyết định số 888/QĐ-ĐHQGHN ngày 28/03/2019 của Giám đốc ĐHQGHN về việc phê duyệt dự án KH&CN do Thủ tướng Chính phủ giao;",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Căn cứ Quyết định số 889/QĐ-ĐHQGHN ngày 23/8/2019 của Giám đốc ĐHQGHN về việc thành lập Văn phòng Dự án Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông;",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Căn cứ Quyết định số 3668/QĐ-ĐHQGHN ngày 19/11/2019 về việc ban hành Quy chế tổ chức và hoạt động của Dự án khoa học và công nghệ \"Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông\";",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Căn cứ Thông tư 55/2015/TTLT-BTC-BKHCN ngày 22/4/2015 về việc hướng dẫn định mức xây dựng, phân bổ dự toán và quyết toán kinh phí đối với nhiệm vụ khoa học và công nghệ có sử dụng ngân sách nhà nước;",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Căn cứ Quyết định số 16/QĐ-VTNT ngày 16/01/2020 về việc ban hành Quy chế chi tiêu nội bộ của Dự án khoa học và công nghệ \"Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông\";",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Căn cứ Giấy ủy quyền số 15/GUQ-VPKĐ ngày 01/09/2020 của Chủ nhiệm Dự án cho Chánh Văn phòng Dự án;",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Căn cứ Quyết định số 14/QĐ-VPKĐ ngày 08/05/2023 về việc ký các hợp đồng dịch thuật Hợp phần Phật tạng tinh yếu giai đoạn 3;",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Căn cứ vào khả năng và nhu cầu của hai bên.",
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Bên A và Bên B
          new Paragraph({
            children: [
              new TextRun({
                text: "Chúng tôi gồm:",
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Bên giao (Bên A): ",
                bold: true,
              }),
              new TextRun({
                text: "Văn phòng Dự án Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông (gọi tắt là \"Dự án\")",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Đại diện và thừa ủy quyền của Chủ nhiệm Dự án: ",
                bold: true,
              }),
              new TextRun({
                text: "Bà Đào Thị Tâm Khánh",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Chức vụ: ",
                bold: true,
              }),
              new TextRun({
                text: "Chánh Văn phòng",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Địa chỉ: ",
                bold: true,
              }),
              new TextRun({
                text: "Số 144 Xuân Thủy, Cầu Giấy, Hà Nội",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Điện thoại: ",
                bold: true,
              }),
              new TextRun({
                text: "02462666889",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Số tài khoản: ",
                bold: true,
              }),
              new TextRun({
                text: "2601183714",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Tại: ",
                bold: true,
              }),
              new TextRun({
                text: "Ngân hàng TMCP Đầu Tư và Phát triển Việt Nam (BIDV) CN Mỹ Đình",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Mã số thuế: ",
                bold: true,
              }),
              new TextRun({
                text: "0107762297 - 001",
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Bên nhận (Bên B): ${translator?.full_name || formData.translator_full_name || "[Tên dịch giả]"}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Số CMT: ${formData.translator_id_card || translator?.id_card_number || "[Số CMND/CCCD]"}`,
              }),
              translator?.id_card_issue_date
                ? new TextRun({
                    text: ` Ngày cấp: ${formatDate(translator.id_card_issue_date)}`,
                  })
                : new TextRun({ text: "" }),
            ],
          }),
          translator?.id_card_issue_place
            ? new Paragraph({
                children: [
                  new TextRun({
                    text: "Nơi cấp: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: translator.id_card_issue_place,
                  }),
                ],
              })
            : new Paragraph({ text: "" }),
          translator?.workplace
            ? new Paragraph({
                children: [
                  new TextRun({
                    text: "Nơi công tác: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: translator.workplace,
                  }),
                ],
              })
            : new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Địa chỉ: ",
                bold: true,
              }),
              new TextRun({
                text: formData.translator_address || translator?.address || "[Địa chỉ]",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Điện thoại: ",
                bold: true,
              }),
              new TextRun({
                text: formData.translator_phone || translator?.phone || "[Số điện thoại]",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Email: ",
                bold: true,
              }),
              new TextRun({
                text: formData.translator_email || translator?.email || "[Email]",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Người thụ hưởng: ",
                bold: true,
              }),
              new TextRun({
                text: translator?.full_name || formData.translator_full_name || "[Tên dịch giả]",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Số tài khoản: ",
                bold: true,
              }),
              new TextRun({
                text: formData.translator_bank_account || translator?.bank_account_number || "[Số tài khoản]",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Tại ngân hàng: ",
                bold: true,
              }),
              new TextRun({
                text: formData.translator_bank_name || translator?.bank_name || "[Tên ngân hàng]",
              }),
            ],
          }),
          formData.translator_bank_branch || translator?.bank_branch
            ? new Paragraph({
                children: [
                  new TextRun({
                    text: "Chi nhánh: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: formData.translator_bank_branch || translator?.bank_branch || "",
                  }),
                ],
              })
            : new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Mã số thuế TNCN: ",
                bold: true,
              }),
              new TextRun({
                text: formData.translator_tax_code || translator?.tax_code || "[Mã số thuế TNCN]",
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Hai bên thỏa thuận kí kết Hợp đồng dịch thuật hợp phần Phật tạng tinh yếu (",
                bold: true,
              }),
              new TextRun({
                text: "sau đây gọi tắt là \"Hợp đồng\"",
                italics: true,
              }),
              new TextRun({
                text: ") với những điều khoản sau:",
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Điều 1
          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 1:",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Bên B cam kết thực hiện việc toàn dịch và chú giải (sau đây gọi tắt là \"dịch thuật\") cho Bên A toàn bộ tài liệu ",
              }),
              new TextRun({
                text: work?.name || "[Tên tác phẩm]",
                italics: true,
              }),
              new TextRun({
                text: ` từ ${work?.source_language || "[Ngôn ngữ nguồn]"} sang ${work?.target_language || "[Ngôn ngữ đích]"} theo thỏa thuận được quy định cụ thể trong Hợp đồng này.`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Tên tài liệu: ",
                bold: true,
              }),
              new TextRun({
                text: work?.name || "[Tên tác phẩm]",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Ngôn ngữ gốc: ",
                bold: true,
              }),
              new TextRun({
                text: work?.source_language || "[Ngôn ngữ nguồn]",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Tổng số trang tài liệu quy đổi cần thực hiện dịch thuật (tạm tính): ",
                bold: true,
              }),
              new TextRun({
                text: `${formatCurrency(formData.base_page_count || 0)} trang (350 chữ/1 trang)`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Nội dung công việc cụ thể bao gồm:",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "1) Toàn dịch, chú giải và chú thích;",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "2) Viết bài giới thiệu tổng quan.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Điều 2
          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 2: Thời gian và kinh phí thực hiện Hợp đồng",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "2.1. Thời gian thực hiện Hợp đồng:",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Tổng thời gian thực hiện Hợp đồng: ",
                bold: true,
              }),
              new TextRun({
                text: `${monthsDiff} tháng kể từ ${formatDate(formData.start_date || "")}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Thời gian giao nộp sản phẩm cuối cùng: ",
                bold: true,
              }),
              new TextRun({
                text: `hết ${formatDate(formData.end_date || "")}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "2.2. Kinh phí thực hiện Hợp đồng:",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Tổng kinh phí khái toán thực hiện Hợp đồng là: ",
                bold: true,
              }),
              new TextRun({
                text: `${formatCurrency(totalAmount)} đồng (Bằng chữ: `,
              }),
              new TextRun({
                text: numberToWords(totalAmount),
                italics: true,
              }),
              new TextRun({
                text: "). Trong đó:",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "+ Kinh phí phiên dịch, chú giải, chú thích: ",
                bold: true,
              }),
              new TextRun({
                text: `${formatCurrency(formData.base_page_count || 0)} trang quy đổi × ${formatCurrency(formData.translation_unit_price || 0)} đ/trang = ${formatCurrency(translationCost)} đồng (Bằng chữ: `,
              }),
              new TextRun({
                text: numberToWords(translationCost),
                italics: true,
              }),
              new TextRun({
                text: ");",
              }),
            ],
          }),
          overviewCost > 0
            ? new Paragraph({
                children: [
                  new TextRun({
                    text: "+ Kinh phí viết \"Bài khảo sát tổng quan\" cho tài liệu trong Điều 1 của Hợp đồng này là: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: `${formatCurrency(overviewCost)} đồng (Bằng chữ: `,
                  }),
                  new TextRun({
                    text: numberToWords(overviewCost),
                    italics: true,
                  }),
                  new TextRun({
                    text: "). Kinh phí này sẽ được thanh toán sau khi được Hội đồng nghiệm thu tài liệu dịch thuật do Bên A tổ chức công nhận là đạt chất lượng.",
                  }),
                ],
              })
            : new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Tổng kinh phí cuối cùng của Hợp đồng căn cứ vào tổng số chữ thực tế của sản phẩm giao nộp cuối cùng đã được Hội đồng nghiệm thu tài liệu dịch thuật do Bên A tổ chức công nhận là đạt chất lượng theo yêu cầu (Không bao gồm phần nguyên văn chữ Hán và phần phiên âm).",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Kinh phí này đã bao gồm những khoản đóng góp nghĩa vụ cho ngân sách Nhà nước theo quy định của pháp luật và theo quy định của Dự án.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Tổng số kinh phí khái toán này Bên A sẽ chuyển vào tài khoản của Bên B theo nội dung và tiến độ như sau:",
                bold: true,
              }),
            ],
          }),
          advance1Percent > 0
            ? new Paragraph({
                children: [
                  new TextRun({
                    text: "+ Đợt 1: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: `Bên A sẽ tạm ứng cho Bên B ${advance1Percent}% tổng kinh phí phiên dịch, chú giải, chú thích ngay sau khi kí Hợp đồng tương ứng số tiền là: ${formatCurrency(advance1Amount)} đồng (Bằng chữ: `,
                  }),
                  new TextRun({
                    text: numberToWords(advance1Amount),
                    italics: true,
                  }),
                  new TextRun({
                    text: ");",
                  }),
                ],
              })
            : new Paragraph({ text: "" }),
          advance2Percent > 0
            ? new Paragraph({
                children: [
                  new TextRun({
                    text: "+ Đợt 2: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: `Bên A sẽ thanh toán cho Bên B số tiền ${advance2Percent}% tổng kinh phí phiên dịch, chú giải, chú thích sau khi Bên A kiểm tra tiến độ và Bên B đạt đủ điều kiện hoàn thành ít nhất 50% khối lượng sản phẩm của hợp đồng, tương ứng số tiền là: ${formatCurrency(advance2Amount)} đồng (Bằng chữ: `,
                  }),
                  new TextRun({
                    text: numberToWords(advance2Amount),
                    italics: true,
                  }),
                  new TextRun({
                    text: ");",
                  }),
                ],
              })
            : new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "+ Đợt 3: ",
                bold: true,
              }),
              new TextRun({
                text: "Bên A sẽ thanh toán cho Bên B số tiền còn lại của Hợp đồng (căn cứ trên tổng kinh phí cuối cùng của Hợp đồng đã khấu trừ các khoản đóng góp nghĩa vụ và bao gồm kinh phí viết bài khảo sát tổng quan theo quy định của Dự án) sau khi bên B giao nộp sản phẩm hoàn chỉnh và nghiệm thu, thanh lí Hợp đồng. Đối với trường hợp bên B không hoàn thành được \"Bài khảo sát tổng quan\" theo yêu cầu của hội đồng nghiệm thu thì bên A sẽ giữ lại phần kinh phí này;",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "+ Bên A sẽ khấu trừ phí quản lí hợp đồng có giá trị 5% trên tổng kinh phí cuối cùng của hợp đồng và thực hiện khấu trừ theo từng lần thanh toán.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "+ Bên A sẽ khấu trừ 10% của tổng kinh phí chuyên môn thực nhận (không bao gồm 5% phí quản lí) của Hợp đồng, theo từng lần thanh toán để thực hiện nghĩa vụ thuế thu nhập cá nhân theo quy định của pháp luật.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Điều 3-6 (simplified)
          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 3: Quyền và trách nhiệm của bên B",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "3.1. ",
                bold: true,
              }),
              new TextRun({
                text: "Bên B cam kết đảm bảo bản toàn dịch, chú giải và chú thích (sau đây gọi tắt là \"bản dịch\") đạt chất lượng, đầy đủ, chính xác, đúng nội dung bản gốc và tuân thủ theo yêu cầu của bản \"Thể lệ dịch thuật Phật tạng tinh yếu\" do Dự án ban hành. Sản phẩm cuối cùng Bên B giao nộp cho Bên A phải được Hội đồng nghiệm thu tài liệu dịch thuật do Bên A tổ chức công nhận là đạt chất lượng theo yêu cầu, bao gồm:",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Bản toàn dịch, chú giải và chú thích.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- 01 bài khảo sát tổng quan về sản phẩm thực hiện theo mẫu và đạt yêu cầu của Dự án, dung lượng từ 8.000 chữ đến 15.000 chữ.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "3.2. ",
                bold: true,
              }),
              new TextRun({
                text: "Bên B cam kết tự tiến hành dịch toàn bộ phần được yêu cầu dịch đã thỏa thuận trong Điều 1 và không chuyển cho bất kì bên thứ ba nào khác dịch thay.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "3.3. ",
                bold: true,
              }),
              new TextRun({
                text: "Bên B cam kết đảm bảo hoàn thành và giao nộp bản dịch theo chất lượng được yêu cầu và thời gian nêu trong hợp đồng.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "3.4. ",
                bold: true,
              }),
              new TextRun({
                text: "Bên B có trách nhiệm cộng tác chặt chẽ với Bên A để sửa chữa, hoàn thiện bản dịch theo tiến độ thời gian và yêu cầu chất lượng cụ thể của Bên A.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "3.5. ",
                bold: true,
              }),
              new TextRun({
                text: "Nếu bản dịch của Bên B được Hội đồng nghiệm thu do Bên A tổ chức đánh giá là đạt chất lượng tốt, hoàn thiện và có thể xuất bản được ngay, thì Bên A sẽ xem xét thanh toán kinh phí hiệu đính cho bên B căn cứ theo nội dung, khối lượng thực hiện cụ thể và theo Quy chế của Dự án.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 4: Quyền và trách nhiệm của Bên A",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "4.1. ",
                bold: true,
              }),
              new TextRun({
                text: "Bên A cam kết cấp kinh phí cho Bên B theo đúng tiến độ thực hiện như quy định tại Điều 2 của Hợp đồng này.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "4.2. ",
                bold: true,
              }),
              new TextRun({
                text: "Bên A có trách nhiệm tổ chức đánh giá tiến độ thực hiện và nghiệm thu bản dịch theo quy định hiện hành.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "4.3. ",
                bold: true,
              }),
              new TextRun({
                text: "Bên A giữ toàn quyền biên tập bản dịch và có quyền yêu cầu Bên B tiến hành sửa chữa, hoàn thiện bản dịch cho đến khi đạt chất lượng được quy định cụ thể theo bản \"Thể lệ dịch thuật Phật tạng tinh yếu\" do Dự án ban hành.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 5: Bản quyền và quyền sở hữu trí tuệ",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "5.1. ",
                bold: true,
              }),
              new TextRun({
                text: "Bản quyền đối với bản dịch do Bên B thực hiện thuộc về Bên A. Bên A nắm quyền sở hữu bản dịch, độc quyền khai thác, phát hành bản dịch dưới mọi hình thức, trên mọi phương tiện theo thời hạn Hợp đồng độc quyền kí với bên B, hoặc không thời hạn đối với tác phẩm hết thời hạn bảo hộ theo quy định của Công ước Berne và pháp luật Việt Nam tại thời điểm kí kết Hợp đồng này.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "5.2. ",
                bold: true,
              }),
              new TextRun({
                text: "Quyền lợi khi xuất bản:",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Bên A: ghi tên: \"Dự án Dịch thuật và phát huy giá trị tinh hoa các tác phẩm kinh điển phương Đông (Viện Trần Nhân Tông, Đại học Quốc gia Hà Nội)\"; Chủ nhiệm Dự án đứng tên Tổng chủ biên; ghi tên Hội đồng biên tập; ghi tên nhà tài trợ cho việc dịch thuật và in ấn.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Bên B được đứng tên thật hoặc bút danh trong phần \"Người dịch\".",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Ghi tên Người hiệu đính (nếu có).",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "- Ghi các thông tin xuất bản khác theo quy định.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "5.3. ",
                bold: true,
              }),
              new TextRun({
                text: "Trong mọi trường hợp, Bên B cam kết không phát tán hay chuyển bản dịch cho bất kì bên thứ ba nào khác mà không được sự cho phép của Bên A. Nếu vi phạm, Bên B sẽ phải đền bù thiệt hại tương ứng cho Bên A theo quy định của pháp luật.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Điều 6: Điều khoản thi hành",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "6.1. ",
                bold: true,
              }),
              new TextRun({
                text: "Hai bên cam kết thực hiện đúng các điều khoản đã được ghi trong hợp đồng, bên nào vi phạm sẽ phải chịu hoàn toàn trách nhiệm theo các quy định hiện hành. Trong quá trình thực hiện hợp đồng, hai bên phải thông báo cho nhau những vấn đề nảy sinh và cùng nhau bàn bạc giải quyết.",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "6.2. ",
                bold: true,
              }),
              new TextRun({
                text: "Hợp đồng này có hiệu lực kể từ ngày kí. Hợp đồng được làm thành 05 bản có giá trị pháp lí như nhau, Bên B giữ 01 bản, Bên A giữ 04 bản (01 bản lưu BCN Dự án, 01 bản lưu Văn thư, 01 bản lưu tại bộ phận Kế toán, 01 bản lưu tại Ban Thư kí Dự án)./.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Signature section
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "BÊN A",
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "CHÁNH VĂN PHÒNG",
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "(Kí, đóng dấu)",
                            italics: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Đào Thị Tâm Khánh",
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "BÊN B",
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "(Kí, ghi rõ họ tên)",
                            italics: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: translator?.full_name || formData.translator_full_name || "[Tên dịch giả]",
                            bold: true,
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Hop-dong-${formData.contract_number || "dich-thuat"}.docx`);
}

export async function generatePDFContract(
  elementId: string,
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Element not found");
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}

