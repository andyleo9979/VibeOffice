// ai-boot.js - Tự động gắn nút AI vào toolbar, không cần sửa menu gốc
(function(){
  function addButton(){
    var bar = document.getElementById('toolbars') || document.getElementById('menurow');
    if(!bar || document.getElementById('vibe-ai-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'vibe-ai-btn';
    btn.textContent = '✦ Analyze with AI';
    btn.title = 'Phân tích dữ liệu với AI (Alt+A)';
    btn.style.cssText = 'background:#2b579a;color:#fff;border:1px solid #1e3f73;padding:4px 10px;margin:2px 4px;cursor:pointer;font:11px Tahoma,sans-serif;border-radius:3px';
    btn.onclick = function(){ window.VibeAI_Panel && window.VibeAI_Panel.open(); };
    bar.appendChild(btn);
  }
  // Chạy sau khi app load xong
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(addButton, 800); });
  window.addEventListener('load', function(){ setTimeout(addButton, 800); });
  // Phím tắt Alt+A
  document.addEventListener('keydown', function(e){
    if(e.altKey && (e.key==='a' || e.key==='A')){ e.preventDefault(); window.VibeAI_Panel && window.VibeAI_Panel.open(); }
  });
  // Thử lại vài lần vì Ledger vẽ menu chậm
  var tries = 0;
  var timer = setInterval(function(){ addButton(); if(++tries>10) clearInterval(timer); }, 1000);
})();
