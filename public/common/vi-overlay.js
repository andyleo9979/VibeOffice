
// vi-overlay.js - BẢN FIX: Luôn hiện nút chuyển đổi, không cần đợi dịch
(function(){
  function createLangButton(){
    if(document.getElementById('vi-lang-btn')) return;
    var btn=document.createElement('button');
    btn.id='vi-lang-btn';
    btn.textContent='🇻🇳 Tiếng Việt | EN';
    btn.style.cssText='position:fixed !important; bottom:16px !important; right:16px !important; z-index:999999 !important; background:#c00000 !important; color:#fff !important; border:2px solid #fff !important; padding:10px 16px !important; border-radius:30px !important; cursor:pointer !important; font:13px Tahoma,sans-serif !important; box-shadow:0 4px 16px rgba(0,0,0,.4) !important; display:block !important;';
    btn.onclick=function(){
      var cur=localStorage.getItem('vibe_lang')||'vi';
      var next=cur==='vi'?'en':'vi';
      localStorage.setItem('vibe_lang', next);
      btn.textContent = next==='vi' ? '🇻🇳 Tiếng Việt | EN' : '🇺🇸 English | VI';
      if(next==='vi') translateAll();
      else location.reload();
    };
    // body có thể chưa có nếu script chạy sớm, đợi body
    if(document.body) document.body.appendChild(btn);
    else document.addEventListener('DOMContentLoaded', ()=>document.body.appendChild(btn));
    console.log('[Vibe VI] Nut chuyen doi da tao');
  }

  const DICT = {
    'File':'Tệp','Edit':'Sửa','View':'Xem','Insert':'Chèn','Format':'Định dạng','Tools':'Công cụ','Data':'Dữ liệu','Help':'Trợ giúp',
    'New':'Mới','Open':'Mở','Save':'Lưu','Save As':'Lưu thành','Print':'In','Undo':'Hoàn tác','Redo':'Làm lại','Cut':'Cắt','Copy':'Sao chép','Paste':'Dán',
    'Home':'Trang chủ','Formulas':'Công thức','Review':'Xem lại','Page Layout':'Bố cục trang','Design':'Thiết kế',
    'Bold':'Đậm','Italic':'Nghiêng','Underline':'Gạch chân','Font':'Phông chữ','Size':'Cỡ chữ',
    'Start Center':'Trung tâm bắt đầu','Recent Files':'File gần đây','Create New':'Tạo mới','Templates':'Mẫu','Options':'Tùy chọn','Settings':'Cài đặt',
    'OK':'Đồng ý','Cancel':'Hủy','Apply':'Áp dụng','Search':'Tìm kiếm','Sheet':'Trang tính','Chart':'Biểu đồ','Slide':'Slide'
  };

  function translateAll(){
    if(!document.body) return;
    document.querySelectorAll('button, a, span, div, td, th, label, option').forEach(el=>{
      if(el.id==='vi-lang-btn') return;
      if(el.children.length===0){
        let txt=el.textContent.trim();
        if(DICT[txt]) el.textContent=DICT[txt];
      }
    });
  }

  // Tạo nút NGAY, không đợi gì cả
  createLangButton();
  // Thử lại vài lần vì Ledger vẽ giao diện chậm
  setTimeout(createLangButton, 500);
  setTimeout(createLangButton, 1500);
  setTimeout(createLangButton, 3000);
  document.addEventListener('DOMContentLoaded', createLangButton);
  window.addEventListener('load', ()=>{ setTimeout(createLangButton, 500); setTimeout(translateAll, 800); });
  if(localStorage.getItem('vibe_lang')===null) localStorage.setItem('vibe_lang','vi');
  if(localStorage.getItem('vibe_lang')==='vi') setTimeout(translateAll, 1000);
})();

