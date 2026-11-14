// VibeOffice Vietnamese Overlay - public/common/vi-overlay.js
// Không sửa code gốc, chỉ dịch text hiển thị. Chạy sau khi app load xong.
(function(){
  const DICT = {
    // Menu chính
    'File':'Tệp','Edit':'Sửa','View':'Xem','Insert':'Chèn','Format':'Định dạng','Tools':'Công cụ','Data':'Dữ liệu','Help':'Trợ giúp','Window':'Cửa sổ',
    'New':'Mới','Open':'Mở','Save':'Lưu','Save As':'Lưu thành','Print':'In','Close':'Đóng','Exit':'Thoát','Undo':'Hoàn tác','Redo':'Làm lại','Cut':'Cắt','Copy':'Sao chép','Paste':'Dán','Select All':'Chọn tất cả','Find':'Tìm','Replace':'Thay thế',
    // Ledger / Spreadsheet
    'Sheet':'Trang tính','Workbook':'Sổ tính','Cell':'Ô','Row':'Hàng','Column':'Cột','Formula':'Công thức','Function':'Hàm','Chart':'Biểu đồ','Sort':'Sắp xếp','Filter':'Lọc','Freeze Panes':'Cố định ô','Merge Cells':'Gộp ô',
    'Bold':'Đậm','Italic':'Nghiêng','Underline':'Gạch chân','Align Left':'Căn trái','Align Center':'Căn giữa','Align Right':'Căn phải','Font':'Phông chữ','Size':'Cỡ chữ','Color':'Màu chữ','Fill Color':'Màu nền',
    'Home':'Trang chủ','Formulas':'Công thức','Review':'Xem lại','Page Layout':'Bố cục trang','References':'Tham chiếu','Mailings':'Gửi thư','Design':'Thiết kế','Layout':'Bố cục','Animations':'Hiệu ứng','Slide Show':'Trình chiếu',
    // Quire
    'Document':'Tài liệu','Paragraph':'Đoạn văn','Spacing':'Giãn cách','Line Spacing':'Giãn dòng','Bullets':'Dấu đầu dòng','Numbering':'Đánh số','Table':'Bảng','Picture':'Hình ảnh','Hyperlink':'Liên kết','Header':'Đầu trang','Footer':'Chân trang','Page Number':'Số trang',
    // Lectern
    'Slide':'Slide','Slides':'Các Slide','New Slide':'Slide mới','Delete Slide':'Xóa Slide','Duplicate Slide':'Nhân đôi Slide','Transition':'Chuyển cảnh','Animation':'Hoạt ảnh',
    // Chung
    'Start Center':'Trung tâm bắt đầu','Recent Files':'File gần đây','Create New':'Tạo mới','Blank Document':'Tài liệu trống','Blank Workbook':'Sổ tính trống','Blank Presentation':'Bài thuyết trình trống','Templates':'Mẫu','Options':'Tùy chọn','Settings':'Cài đặt','Language':'Ngôn ngữ','English':'Tiếng Anh','Vietnamese':'Tiếng Việt',
    'OK':'Đồng ý','Cancel':'Hủy','Apply':'Áp dụng','Yes':'Có','No':'Không','Search':'Tìm kiếm','Open File':'Mở file','Download':'Tải xuống','Upload':'Tải lên',
    'Word processor':'Soạn thảo văn bản','Spreadsheet':'Bảng tính','Presentations':'Bài thuyết trình',
    'Analyze with AI':'Phân tích với AI',
    'Spelling':'Chính tả','Grammar':'Ngữ pháp','Thesaurus':'Từ đồng nghĩa','Zoom':'Thu phóng'
  };

  function translateNode(node){
    if(node.nodeType===3){ // text node
      let t=node.nodeValue;
      if(!t || !t.trim()) return;
      let trimmed=t.trim();
      if(DICT[trimmed]){
        node.nodeValue = t.replace(trimmed, DICT[trimmed]);
      }
      return;
    }
    if(node.nodeType!==1) return;
    if(['SCRIPT','STYLE','TEXTAREA','INPUT'].includes(node.tagName)) return;
    // title / placeholder / aria-label
    ['title','placeholder','aria-label'].forEach(attr=>{
      let v=node.getAttribute && node.getAttribute(attr);
      if(v && DICT[v.trim()]) node.setAttribute(attr, DICT[v.trim()]);
    });
    for(let c of node.childNodes) translateNode(c);
  }

  function translateAll(){
    translateNode(document.body || document.documentElement);
    // Menu của VibeOffice được vẽ bằng JS nên cần quét lại
    document.querySelectorAll('button, a, span, div, td, th, label, option').forEach(el=>{
      if(el.children.length===0){
        let txt=el.textContent.trim();
        if(DICT[txt]) el.textContent = DICT[txt];
      }
    });
  }

  function addLangSwitch(){
    if(document.getElementById('vi-lang-btn')) return;
    let btn=document.createElement('button');
    btn.id='vi-lang-btn';
    btn.textContent='🇻🇳 Tiếng Việt';
    btn.style.cssText='position:fixed;bottom:12px;right:12px;z-index:99999;background:#c00000;color:#fff;border:none;padding:8px 12px;border-radius:20px;cursor:pointer;font:12px Tahoma;box-shadow:0 2px 8px rgba(0,0,0,.3)';
    btn.onclick=()=>{
      let cur=localStorage.getItem('vibe_lang')||'vi';
      let next=cur==='vi'?'en':'vi';
      localStorage.setItem('vibe_lang', next);
      if(next==='vi'){ translateAll(); btn.textContent='🇻🇳 Tiếng Việt'; }
      else { location.reload(); }
    };
    document.body.appendChild(btn);
  }

  function init(){
    if(localStorage.getItem('vibe_lang')===null) localStorage.setItem('vibe_lang','vi');
    if(localStorage.getItem('vibe_lang')!=='vi') return;
    translateAll();
    addLangSwitch();
    // Quét lại mỗi 1s vì menu / dialog được vẽ động
    setInterval(translateAll, 1000);
    // Quan sát DOM thay đổi
    const obs=new MutationObserver(()=>translateAll());
    obs.observe(document.body, {childList:true, subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(init, 500));
  else setTimeout(init, 500);
})();
