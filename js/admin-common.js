(function(){
 const client=window.scentieSupabase;
 const money=n=>new Intl.NumberFormat("vi-VN").format(Number(n)||0)+"đ";
 const date=v=>v?new Intl.DateTimeFormat("vi-VN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v)):"—";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const labels={pending:"Chờ xác nhận",confirmed:"Đã xác nhận",processing:"Đang xử lý",shipped:"Đang giao",delivered:"Đã giao",cancelled:"Đã hủy",paid:"Đã thanh toán",failed:"Thất bại",refunded:"Đã hoàn tiền"};
 const status=s=>`<span class="admin-status status-${esc(s)}">${esc(labels[s]||s||"—")}</span>`;
 function toast(message,type="success"){const el=document.getElementById("adminToast");if(!el)return;el.textContent=message;el.className="admin-toast show"+(type==="error"?" error":"");clearTimeout(window.__adminToastTimer);window.__adminToastTimer=setTimeout(()=>el.classList.remove("show"),3200);}
 function openModal(id){document.getElementById(id)?.classList.add("open")}
 function closeModals(){document.querySelectorAll(".admin-modal.open").forEach(m=>m.classList.remove("open"))}
 document.addEventListener("click",e=>{if(e.target.matches("[data-close-modal]"))closeModals();if(e.target.classList.contains("admin-modal"))closeModals()});
 window.AdminUI={client,money,date,esc,status,labels,toast,openModal,closeModals};
 window.adminToast=toast;
})();
