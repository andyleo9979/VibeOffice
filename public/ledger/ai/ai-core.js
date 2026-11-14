// VibeOffice AI - ai-core.js
// Vanilla JS, no dependency. Privacy-first: Local first, API optional.
(function(global){
  'use strict';

  // --- Utils: Convert selected range to CSV (only send selected range) ---
  function rangeToCSV(rangeData){
    // rangeData: 2D array [[...],[...]]
    if(!Array.isArray(rangeData)) return '';
    return rangeData.slice(0,200).map(row => row.map(c => {
      const s = String(c ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? '"'+s.replace(/"/g,'""')+'"' : s;
    }).join(',')).join('\n');
  }

  // --- Prompt ---
  const PROMPTS = {
    data_analyst: `Bạn là chuyên gia phân tích dữ liệu Excel. Chỉ dùng dữ liệu được cung cấp, không bịa số.
Trả về JSON duy nhất, không giải thích ngoài JSON:
{"summary": "...", "insights": [{"title":"", "detail":"", "cells":"A1:B10"}],
"charts":[{"type":"column|line|pie", "x":"col name", "y":"col name", "title":""}],
"formulas":[{"target":"F2", "formula":"=SUM(...)", "explain":""}],
"warnings":[{"type":"empty|duplicate|format", "detail":""}],
"answer_vi": "Câu trả lời tiếng Việt ngắn gọn"}`,
    formula_gen: `Bạn là chuyên gia Excel. Chỉ trả về JSON: {"formula":"=...", "explain_vi":"..."}. Không bịa tên cột.`
  };

  // --- Base Provider ---
  class AIProvider {
    async analyze({rangeData, question}){ throw new Error('Not implemented'); }
  }

  // --- Local AI (placeholder, hook for transformers.js / web-llm) ---
  class LocalAI extends AIProvider {
    async analyze({rangeData, question}){
      // Fallback rule-based khi chưa có model local: vẫn cho insight cơ bản mà không cần mạng
      const rows = rangeData || [];
      const header = rows[0] || [];
      const dataRows = rows.slice(1);
      const numericCols = header.map((h, idx) => {
        const vals = dataRows.map(r=>Number(r[idx])).filter(v=>!isNaN(v));
        return {name:h, idx, count:vals.length, sum: vals.reduce((a,b)=>a+b,0), avg: vals.length? vals.reduce((a,b)=>a+b,0)/vals.length:0, max: vals.length? Math.max(...vals):0, min: vals.length? Math.min(...vals):0 };
      }).filter(c=>c.count>0);
      return {
        summary: `Đã phân tích ${dataRows.length} dòng, ${header.length} cột. ${numericCols.length} cột số.`,
        insights: numericCols.map(c=>({title:`Cột ${c.name}`, detail:`Tổng ${c.sum.toFixed(2)}, trung bình ${c.avg.toFixed(2)}, max ${c.max}, min ${c.min}`, cells:''})),
        charts: numericCols.slice(0,1).map(c=>({type:'column', x: String(header[0]), y: c.name, title:`${c.name} theo ${header[0]}`})),
        formulas: [],
        warnings: dataRows.some(r=>r.includes('')||r.includes(null)) ? [{type:'empty', detail:'Có ô trống trong vùng chọn'}] : [],
        answer_vi: `Đã phân tích offline (Local AI). Nối API để có insight sâu hơn.`
      };
    }
  }

  // --- OpenAI-compatible Provider (OpenAI, Gemini OpenAI-compat, Ollama, proxy nội bộ) ---
  class OpenAICompatibleProvider extends AIProvider {
    constructor({apiKey='', baseUrl='https://api.openai.com/v1', model='gpt-4o-mini'}={}){
      super();
      this.apiKey=apiKey; this.baseUrl=baseUrl.replace(/\/$/,''); this.model=model;
    }
    async analyze({rangeData, question='Hãy phân tích dữ liệu này, tìm insight quan trọng nhất'}){
      const csv = rangeToCSV(rangeData);
      const res = await fetch(this.baseUrl + '/chat/completions', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+this.apiKey},
        body: JSON.stringify({
          model:this.model,
          response_format:{type:'json_object'},
          messages:[
            {role:'system', content: PROMPTS.data_analyst},
            {role:'user', content:`Dữ liệu (CSV, tối đa 200 dòng):\n${csv}\n\nCâu hỏi: ${question}`}
          ],
          temperature:0.2
        })
      });
      if(!res.ok) throw new Error('AI API error: '+res.status);
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content || '{}';
      try{ return JSON.parse(text); } catch(e){ return {summary:text, insights:[], charts:[], formulas:[], warnings:[], answer_vi:text}; }
    }
    async generateFormula({headers, question}){
      const res = await fetch(this.baseUrl + '/chat/completions', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+this.apiKey},
        body: JSON.stringify({model:this.model, response_format:{type:'json_object'}, messages:[{role:'system', content:PROMPTS.formula_gen},{role:'user', content:`Cột: ${headers.join(', ')}\nYêu cầu: ${question}`}], temperature:0})
      });
      const j = await res.json();
      try{ return JSON.parse(j.choices[0].message.content); } catch{ return {formula:'', explain_vi: j.choices[0].message.content}; }
    }
  }

  // --- Factory ---
  function getProvider(){
    const cfg = JSON.parse(localStorage.getItem('vibeoffice_ai_config') || '{}');
    if(cfg.enabled && cfg.apiKey) return new OpenAICompatibleProvider(cfg);
    return new LocalAI();
  }
  function saveConfig(cfg){ localStorage.setItem('vibeoffice_ai_config', JSON.stringify(cfg)); }

  global.VibeAI = { AIProvider, LocalAI, OpenAICompatibleProvider, getProvider, saveConfig, PROMPTS, rangeToCSV };
})(typeof window!=='undefined'?window:globalThis);

