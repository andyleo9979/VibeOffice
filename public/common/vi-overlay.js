// vi-overlay v3 - FIX chuyển đổi ngôn ngữ thật sự
(function(){
  const DICT = {
    'File':'Tệp','Edit':'Sửa','View':'Xem','Insert':'Chèn','Format':'Định dạng','Tools':'Công cụ','Data':'Dữ liệu','Help':'Trợ giúp','Window':'Cửa sổ',
    'New':'Mới','Open':'Mở','Save':'Lưu','Save As':'Lưu thành','Save a Copy':'Lưu bản sao','Print':'In','Close':'Đóng','Exit':'Thoát',
    'Undo':'Hoàn tác','Redo':'Làm lại','Cut':'Cắt','Copy':'Sao chép','Paste':'Dán','Select All':'Chọn tất cả','Find':'Tìm','Replace':'Thay thế',
    'Home':'Trang chủ','Formulas':'Công thức','Review':'Xem lại','Page Layout':'Bố cục trang','References':'Tham chiếu','Mailings':'Gửi thư','Design':'Thiết kế','Layout':'Bố cục','Animations':'Hiệu ứng','Slide Show':'Trình chiếu','View':'Xem',
    'Bold':'Đậm','Italic':'Nghiêng','Underline':'Gạch chân','Align Left':'Căn trái','Align Center':'Căn giữa','Align Right':'Căn phải','Font':'Phông chữ','Size':'Cỡ chữ','Color':'Màu chữ',
    'Sheet':'Trang tính','Chart':'Biểu đồ','Sort':'Sắp xếp','Filter':'Lọc','Freeze Panes':'Cố định ô','Merge Cells':'Gộp ô',
    'Start Center':'Trung tâm bắt đầu','Recent Files':'File gần đây','Create New':'Tạo mới','Blank Document':'Tài liệu trống','Templates':'Mẫu','Options':'Tùy chọn','Settings':'Cài đặt','Language':'Ngôn ngữ',
    'OK':'Đồng ý','Cancel':'Hủy','Apply':'Áp dụng','Yes':'Có','No':'Không','Search':'Tìm kiếm','Open File':'Mở file','Download':'Tải xuống',
    'Word processor':'Soạn thảo văn bản','Spreadsheet':'Bảng tính','Presentations':'Bài thuyết trình','Document':'Tài liệu','Paragraph':'Đoạn văn','Table':'Bảng','Picture':'Hình ảnh','Slide':'Slide','New Slide':'Slide mới'
  };
  // Lưu bản gốc để đổi qua lại được
  const ORIG = new Map();
  function translateAll(){
    if(localStorage.getItem('vibe_lang')!=='vi') return;
    // Duyệt mọi text node, không chỉ button
    const walker=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while(n=walker.nextNode()){
      if(!n.nodeValue || !n.nodeValue.trim()) continue;
      if(n.parentElement && (n.parentElement.id==='vi-lang-btn' || n.parentElement.closest('#vi-lang-btn'))) continue;
      let t=n.nodeValue.trim();
      if(DICT[t]){
        if(!ORIG.has(n)) ORIG.set(n, n.nodeValue);
        n.nodeValue=n.nodeValue.replace(t, DICT[t]);
      }
    }
    // Thuộc tính title / placeholder
    document.querySelectorAll('[title],[placeholder]').forEach(el=>{
      let v=el.getAttribute('title'); if(v && DICT[v.trim()]) el.setAttribute('title', DICT[v.trim()]);
    });
  }
  function restoreEN(){
    ORIG.forEach((orig, node)=>{ try{ node.nodeValue=orig; }catch(e){} });
    ORIG.clear();
  }
  function createBtn(){
    if(document.getElementById('vi-lang-btn')) return;
    let btn=document.createElement('button');
    btn.id='vi-lang-btn';
    btn.textContent = (localStorage.getItem('vibe_lang')==='vi') ? '🇻🇳 TIẾNG VIỆT - Bấm để đổi sang EN' : '🇺🇸 ENGLISH - Click to VI';
    btn.style.cssText='position:fixed!important;bottom:16px!important;right:16px!important;z-index:999999!important;background:#c00000!important;color:#fff!important;border:2px solid #fff!important;padding:10px 16px!important;border-radius:30px!important;cursor:pointer!important;font:13px Tahoma!important;box-shadow:0 4px 16px rgba(0,0,0,.4)!important;';
    btn.onclick=function(){
      let cur=localStorage.getItem('vibe_lang')||'vi';
      let next=cur==='vi'?'en':'vi';
      localStorage.setItem('vibe_lang', next);
      if(next==='vi'){ btn.textContent='🇻🇳 TIẾNG VIỆT - Bấm để đổi sang EN'; translateAll(); }
      else { btn.textContent='🇺🇸 ENGLISH - Click to VI'; restoreEN(); }
      console.log('[VI] Da doi sang', next);
    };
    (document.body||document.documentElement).appendChild(btn);
  }
  if(localStorage.getItem('vibe_lang')===null) localStorage.setItem('vibe_lang','vi');
  createBtn();
  // QUAN TRỌNG: Ledger vẽ lại liên tục nên phải dịch lại mỗi 800ms
  setInterval(()=>{ createBtn(); translateAll(); }, 800);
  // Quan sát DOM thay đổi
  const obs=new MutationObserver(()=>translateAll());
  if(document.body) obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('load',()=>{ setTimeout(translateAll,500); setTimeout(translateAll,1500); });
})();
