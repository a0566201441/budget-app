
  (function(){
    if (window.__mobileEnhanceV29Installed) return;
    window.__mobileEnhanceV29Installed = true;

    function ensurePanel(tr, openIfEmpty){
      var panel = tr.querySelector('td.mobile-details-panel');
      if (!panel){
        panel = document.createElement('td');
        panel.className = 'mobile-details-panel';
        var list = document.createElement('div'); list.className = 'details-list'; panel.appendChild(list);
        var ph = document.createElement('div'); ph.className = 'placeholder'; ph.textContent = 'لا توجد بنود تفصيلية'; panel.appendChild(ph);
        tr.appendChild(panel);
      }
      var list = panel.querySelector('.details-list'); var ph = panel.querySelector('.placeholder');
      if (openIfEmpty === true) panel.style.display = 'block'; ph.style.display = list.children.length > 0 ? 'none' : 'block'; return panel;
    }

    function updatePaidFromPanel(tr){
      var panel = tr.querySelector('td.mobile-details-panel'); if (!panel) return;
      var vals = panel.querySelectorAll('.detail-item input[data-role="value"]'); var sum = 0;
      vals.forEach(function(inp){ var v = parseFloat((inp.value || '').replace(/,/g,'')); if (!isNaN(v)) sum += v; });
      var paidInput = tr.querySelector('td:nth-child(3) input'); if (paidInput){ paidInput.value = sum || 0; }
      var pEl = tr.querySelector('td:nth-child(2) input'); var dEl = tr.querySelector('td:nth-child(3) input');
      var planned = parseFloat((pEl && pEl.value)||0) || 0; var paid = parseFloat((dEl && dEl.value)||0) || 0;
      var el = tr.querySelector('.mobile-status-text') || (function(){ var e=document.createElement('div'); e.className='mobile-status-text neutral'; var cell=tr.querySelector('td:nth-child(5)'); if(cell) cell.appendChild(e); return e; })();
      if (paid > planned){ var diff = (paid - planned).toFixed(2).replace(/\.00$/,''); el.className='mobile-status-text over'; el.textContent='تجاوز المخطط بـ ' + diff; }
      else if (planned > paid){ var left = (planned - paid).toFixed(2).replace(/\.00$/,''); el.className='mobile-status-text ok'; el.textContent='المتبقي ' + left; }
      else { el.className='mobile-status-text neutral'; el.textContent='مطابق للمخطط'; }
    }

    function addDetailItem(tr){
      if (tr.dataset.detailLock === '1') return; tr.dataset.detailLock = '1'; setTimeout(function(){ tr.dataset.detailLock = '0'; }, 300);
      var panel = ensurePanel(tr, true); var list = panel.querySelector('.details-list');
      var item = document.createElement('div'); item.className = 'detail-item';
      var name = document.createElement('input'); name.type = 'text'; name.placeholder = 'اسم التفصيل';
      var value = document.createElement('input'); value.type = 'number'; value.setAttribute('data-role','value'); value.placeholder = 'القيمة'; value.inputMode = 'numeric'; value.pattern = '[0-9]*';
      value.addEventListener('input', function(){ updatePaidFromPanel(tr); });
      var del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.textContent = '×';
      del.addEventListener('click', function(){ item.remove(); var panel = ensurePanel(tr, false); var list = panel.querySelector('.details-list'); panel.querySelector('.placeholder').style.display = list.children.length > 0 ? 'none' : 'block'; updatePaidFromPanel(tr); });
      item.appendChild(name); item.appendChild(value); item.appendChild(del); list.appendChild(item);
      panel.querySelector('.placeholder').style.display = 'none'; updatePaidFromPanel(tr);
    }

    function hideLegacyButtons(tr){
      var actionsCell = tr.querySelector('td:nth-child(6)'); if (!actionsCell) return;
      Array.from(actionsCell.querySelectorAll('button, .btn, a')).forEach(function(b){
        var t = (b.innerText||b.textContent||'').trim();
        if (/تفصيل|تفاصيل|detail|\+/.test(t)) { b.classList.add('is-details-btn'); b.style.display='none'; }
      });
    }

    function wireInputs(tr){
      var p = tr.querySelector('td:nth-child(2) input'); var d = tr.querySelector('td:nth-child(3) input');
      function refresh(){ updatePaidFromPanel(tr); }
      if (p) p.addEventListener('input', refresh); if (d) d.addEventListener('input', refresh); refresh();
    }

    function enhanceRow(tr){
      if (!tr || tr.getAttribute('data-mobile-enhanced') === '1') return; var tds = tr.querySelectorAll('td'); if (tds.length < 6) return;
      hideLegacyButtons(tr);
      var addCell = document.createElement('td'); addCell.className='mobile-details-input'; var addBtn=document.createElement('button'); addBtn.type='button'; addBtn.className='btn'; addBtn.textContent='تفصيل +'; addBtn.addEventListener('click', function(){ addDetailItem(tr); }); addCell.appendChild(addBtn);
      var toggleCell = document.createElement('td'); toggleCell.className='mobile-details-toggle'; var toggleBtn=document.createElement('button'); toggleBtn.type='button'; toggleBtn.className='btn'; toggleBtn.textContent='إظهار/إخفاء'; toggleBtn.addEventListener('click', function(){ var panel = ensurePanel(tr, false); panel.style.display = (panel.style.display === 'none' || panel.style.display === '') ? 'block' : 'none'; }); toggleCell.appendChild(toggleBtn);
      ensurePanel(tr, false);
      tr.appendChild(addCell); tr.appendChild(toggleCell);
      wireInputs(tr);
      tr.setAttribute('data-mobile-enhanced','1');
    }

    function enhanceAll(){ var table=document.getElementById('rows'); if(!table) return; var rows=table.querySelectorAll('tbody tr'); rows.forEach(enhanceRow); }
    function hideHeader(){ try{ var table=document.getElementById('rows'); if(!table) return; var prev=table.previousElementSibling; if (prev) prev.style.display='none'; }catch(e){} }

    function patchAddButton(){
      var btn = document.getElementById('add'); if (!btn) return;
      // Since we removed inline handlers already, just ensure single click handler exists (handled in bind())
    }

    function install(){
      if (!window.matchMedia || !window.matchMedia('(max-width: 430px)').matches) return;
      enhanceAll(); hideHeader(); patchAddButton();
      var table=document.getElementById('rows'); if (table){ var tb=table.querySelector('tbody') || table; var obs=new MutationObserver(function(){ enhanceAll(); }); obs.observe(tb, { childList:true, subtree:true }); }
      document.documentElement.style.overflowX='hidden'; document.body.style.overflowX='hidden';
    }

    if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', install, {once:true}); }
    else { install(); }
  })();
  