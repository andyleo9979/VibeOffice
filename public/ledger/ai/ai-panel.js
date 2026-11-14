// VibeOffice AI Panel - Task pane bên phải
(function(){
  const PANEL_ID='vibe-ai-panel';
  function ensurePanel(){
    let el=document.getElementById(PANEL_ID);
    if(el) return el;
    el=document.createElement('div');
    el.id=PANEL_ID;
    el.style.cssText='position:fixed;right:0;top:0;width:360px;height:100%;background:#fff;border-left:1px solid #c5c5c5;z-index:9999;display:flex;flex-direction:column;font-family:Tahoma,Arial,sans-serif;box-shadow:-2px 0 8px rgba(0,0,0,.1)';
    el.innerHTML=`
      <div style="background:#2b579a;color:#fff;padding:10px 12px;display:flex;justify-content:space-between;align-items:center">
        <b>✦ AI Phân tích dữ liệu</b><button id="ai-close" style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px">✕</button>
      </div>
      <div style="padding:10px;border-bottom:1px solid #eee">
        <label style="font-size:12px;color:#555">Chọn vùng dữ liệu, rồi hỏi AI:</label>
        <textarea id="ai-q" rows="2" style="width:100%;margin:6px 0;padding:8px;box-sizing:border-box" placeholder="VD: Quý nào doanh thu cao nhất? Có outlier không?"></textarea>
        <div style="display:flex;gap:6px">
          <button id="ai-analyze" style="flex:1;background:#2b579a;color:#fff;border:none;padding:8px;cursor:pointer">Phân tích</button>
          <button id="ai-formula" style="flex:1;background:#fff;border:1px solid #2b579a;color:#2b579a;padding:8px;cursor:pointer">Tạo công thức</button>
        </div>
        <label style="display:block;margin-top:8px;font-size:11px;color:#888"><input type="checkbox" id="ai-privacy"> Chỉ dùng Local AI (không gửi dữ liệu ra ngoài)</label>
      </div>
      <div id="ai-result" style="flex:1;overflow:auto;padding:12px;font-size:13px;line-height:1.5"></div>
      <div style="padding:8px;border-top:1px solid #eee;font-size:11px;color:#888">API Key lưu ở localStorage • Chỉ gửi vùng bạn chọn (tối đa 200 dòng) • <a href="#" id="ai-settings">Cài đặt AI</a></div>`;
    document.body.appendChild(el);
    document.getElementById('ai-close').onclick=()=>el.style.display='none';
    document.getElementById('ai-settings').onclick=(e)=>{e.preventDefault(); openSettings();};
    document.getElementById('ai-analyze').onclick=onAnalyze;
    document.getElementById('ai-formula').onclick=onFormula;
    return el;
  }
  function open(){
    const el=ensurePanel(); el.style.display='flex';
    document.getElementById('ai-result').innerHTML='<i>Chọn vùng dữ liệu trong Ledger rồi bấm Phân tích...</i>';
  }
  function getSelectedRange(){
    // Hook: Ledger cần expose window.LedgerAPI.getSelectedRange()
    // Fallback: lấy từ global nếu có, nếu không dùng demo
    if(window.LedgerAPI && window.LedgerAPI.getSelectedRange) return window.LedgerAPI.getSelectedRange();
    // Demo data để test ngay khi chưa nối engine thật
    return [["Tháng","Doanh thu","Chi phí"],["01/2026",120000,80000],["02/2026",145000,85000],["03/2026",98000,90000]];
  }
  async function onAnalyze(){
    const resultEl=document.getElementById('ai-result');
    resultEl.innerHTML='⏳ Đang phân tích...';
    try{
      const provider = document.getElementById('ai-privacy').checked ? new window.VibeAI.LocalAI() : window.VibeAI.getProvider();
      const data = getSelectedRange();
      const q = document.getElementById('ai-q').value || 'Hãy phân tích dữ liệu này';
      const r = await provider.analyze({rangeData:data, question:q});
      resultEl.innerHTML = `
        <h3 style="margin:0 0 8px">📊 ${r.summary||''}</h3>
        <p>${r.answer_vi||''}</p>
        <h4>💡 Insights</h4>${(r.insights||[]).map(i=>`<div style="border:1px solid #eee;padding:8px;margin:6px 0;border-radius:4px"><b>${i.title}</b><br>${i.detail}</div>`).join('')||'<i>Chưa có</i>'}
        <h4>📈 Gợi ý biểu đồ</h4>${(r.charts||[]).map(c=>`<div>• ${c.title} - ${c.type} (X: ${c.x}, Y: ${c.y}) <button onclick="alert('Gọi Ledger.createChart(${c.type})')">Tạo</button></div>`).join('')||'<i>Chưa có</i>'}
        <h4>🧮 Công thức</h4>${(r.formulas||[]).map(f=>`<div><code>${f.formula}</code> - ${f.explain||''} <button onclick="navigator.clipboard.writeText('${f.formula}')">Copy</button></div>`).join('')||'<i>Chưa có</i>'}
        ${r.warnings?.length?`<h4>⚠️ Cảnh báo</h4>${r.warnings.map(w=>`<div>• ${w.detail}</div>`).join('')}`:''}
      `;
    }catch(e){ resultEl.innerHTML=`<b style="color:red">Lỗi: ${e.message}</b><br>Hãy kiểm tra API Key trong Cài đặt AI.`; }
  }
  async function onFormula(){
    const q=document.getElementById('ai-q').value;
    if(!q) return alert('Nhập yêu cầu, VD: Tính tổng doanh thu theo tháng');
    const data=getSelectedRange();
    const provider=window.VibeAI.getProvider();
    if(provider.generateFormula){
      const r=await provider.generateFormula({headers:data[0], question:q});
      document.getElementById('ai-result').innerHTML=`<h3>Công thức gợi ý</h3><code style="background:#f5f5f5;padding:8px;display:block">${r.formula}</code><p>${r.explain_vi||''}</p><button onclick="navigator.clipboard.writeText('${r.formula}')">Copy công thức</button>`;
    } else {
      document.getElementById('ai-result').innerHTML='Local AI chưa hỗ trợ tạo công thức, hãy bật API.';
    }
  }
  function openSettings(){
    const cfg=JSON.parse(localStorage.getItem('vibeoffice_ai_config')||'{}');
    const apiKey=prompt('Nhập API Key (OpenAI / Gemini / proxy nội bộ):', cfg.apiKey||'');
    if(apiKey===null) return;
    const baseUrl=prompt('Base URL:', cfg.baseUrl||'https://api.openai.com/v1');
    const model=prompt('Model:', cfg.model||'gpt-4o-mini');
    window.VibeAI.saveConfig({enabled:true, apiKey, baseUrl, model});
    alert('Đã lưu! API Key chỉ lưu trên máy bạn.');
  }
  window.VibeAI_Panel={open};
  // Thêm menu nếu Ledger chưa có
  document.addEventListener('DOMContentLoaded', ()=>{
    // Bạn có thể gọi VibeAI_Panel.open() từ menu Data > Analyze with AI
  });
})();

