// Smart Filter - Lọc thông minh: đếm giá trị trùng trong cột
// Dùng: chọn 1 cột trong Ledger -> bấm nút Lọc thông minh
(function(){
  function getSelectedColumnData(){
    if(window.LedgerAPI && window.LedgerAPI.getSelectedRange) return window.LedgerAPI.getSelectedRange();
    // Demo để test ngay
    return [["Sản phẩm","Số lượng"],["Áo",10],["Quần",5],["Áo",12],["Giày",7],["Áo",3],["Quần",8]];
  }
  function countDuplicates(data){
    // data[0] là header, còn lại là dữ liệu
    const header=data[0][0]||'Cột';
    const map=new Map();
    for(let i=1;i<data.length;i++){
      let v=String(data[i][0]??'(Trống)');
      map.set(v,(map.get(v)||0)+1);
    }
    // Sort giảm dần theo số lượng
    return {header, total:data.length-1, unique:map.size, items:[...map.entries()].sort((a,b)=>b[1]-a[1])};
  }
  function openPanel(){
    let old=document.getElementById('smart-filter-panel');
    if(old) old.remove();
    let data=getSelectedColumnData();
    let res=countDuplicates(data);
    let panel=document.createElement('div');
    panel.id='smart-filter-panel';
    panel.style.cssText='position:fixed;right:380px;top:60px;width:360px;max-height:80vh;overflow:auto;background:#fff;border:1px solid #d9e2ec;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);z-index:99998;padding:14px;font:13px Tahoma,sans-serif';
    let rows=res.items.map(([val,count])=>{
      let pct=Math.round(count/res.total*100);
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9">
        <input type="checkbox" checked data-val="${val}" style="accent-color:#2b579a">
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${val}</span>
        <span style="background:#edf2fa;color:#2b579a;padding:2px 8px;border-radius:12px;font-weight:600">${count} (${pct}%)</span>
        <div style="width:60px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden"><div style="width:${pct}%;height:100%;background:#2b579a"></div></div>
      </div>`;
    }).join('');
    panel.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center"><b>🔍 Lọc thông minh - ${res.header}</b><button id="sf-close" style="border:none;background:none;cursor:pointer;font-size:18px">✕</button></div>
      <p style="color:#64748b;margin:8px 0">Tổng <b>${res.total}</b> dòng • <b>${res.unique}</b> giá trị khác nhau • <b>${res.total-res.unique}</b> dòng trùng</p>
      <div style="display:flex;gap:6px;margin-bottom:10px">
        <input id="sf-search" placeholder="Tìm giá trị..." style="flex:1;padding:8px;border:1px solid #d9e2ec;border-radius:8px">
        <button id="sf-sort" style="padding:8px 10px;border:1px solid #d9e2ec;background:#fff;border-radius:8px;cursor:pointer">Sắp xếp</button>
      </div>
      <div id="sf-list">${rows}</div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button id="sf-apply" style="flex:1;background:#2b579a;color:#fff;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:600">Áp dụng lọc</button>
        <button id="sf-all" style="flex:1;background:#fff;border:1px solid #d9e2ec;padding:10px;border-radius:8px;cursor:pointer">Chọn tất cả</button>
      </div>
      <p style="font-size:11px;color:#888;margin-top:8px">Tip: Bỏ tick giá trị bạn muốn ẩn, rồi bấm Áp dụng lọc.</p>
    `;
    document.body.appendChild(panel);
    document.getElementById('sf-close').onclick=()=>panel.remove();
    document.getElementById('sf-search').oninput=(e)=>{
      let q=e.target.value.toLowerCase();
      document.querySelectorAll('#sf-list > div').forEach(div=>{
        div.style.display = div.textContent.toLowerCase().includes(q) ? 'flex':'none';
      });
    };
    document.getElementById('sf-apply').onclick=()=>{
      let checked=[...document.querySelectorAll('#sf-list input:checked')].map(i=>i.getAttribute('data-val'));
      alert('Đã chọn lọc: '+checked.join(', ')+'\\n\\n(Nối vào LedgerAPI.filter() để lọc thật trong bảng)');
      // TODO nối thật: window.LedgerAPI.filterColumn(checked)
    };
  }
  function addButton(){
    if(document.getElementById('smart-filter-btn')) return;
    let bar=document.getElementById('toolbars')||document.getElementById('menurow');
    if(!bar) return;
    let btn=document.createElement('button');
    btn.id='smart-filter-btn';
    btn.textContent='🔍 Lọc thông minh';
    btn.title='Đếm giá trị trùng trong cột';
    btn.style.cssText='background:#fff;border:1px solid #d9e2ec;padding:5px 12px;border-radius:20px;cursor:pointer;font:12px Tahoma;margin:2px 4px';
    btn.onclick=openPanel;
    bar.appendChild(btn);
  }
  setInterval(addButton, 1000);
  window.SmartFilter={open:openPanel};
})();
