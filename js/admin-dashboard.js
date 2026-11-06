(function(){
 const ui=window.AdminUI;if(!ui)return;const c=ui.client;
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 const dayKey=d=>d.toISOString().slice(0,10);
 async function load(){
  try{
   const [{data:orders,error:oe},{count:productsCount,error:pe}]=await Promise.all([
    c.from("orders").select("id,order_code,recipient_name,recipient_phone,order_status,total_amount,created_at,payment_status",{count:"exact"}).order("created_at",{ascending:false}).limit(500),
    c.from("products").select("id",{count:"exact",head:true}).eq("is_active",true)
   ]);
   if(oe)throw oe;if(pe)throw pe;
   const list=orders||[],active=list.filter(o=>o.order_status!=="cancelled");
   set("totalOrders",new Intl.NumberFormat("vi-VN").format(list.length));
   set("totalRevenue",ui.money(active.reduce((s,o)=>s+Number(o.total_amount||0),0)));
   set("pendingOrders",list.filter(o=>o.order_status==="pending").length);
   set("totalProducts",productsCount??"—");
   const body=document.getElementById("recentOrdersBody");
   body.innerHTML=list.slice(0,7).map(o=>`<tr><td><strong>${ui.esc(o.order_code)}</strong></td><td>${ui.esc(o.recipient_name)}</td><td>${ui.date(o.created_at)}</td><td>${ui.money(o.total_amount)}</td><td>${ui.status(o.order_status)}</td></tr>`).join("")||'<tr><td colspan="5" class="admin-table-empty">Chưa có đơn hàng.</td></tr>';
   renderChart(list);renderBreakdown(list);
  }catch(e){console.error(e);ui.toast("Không thể tải dữ liệu Dashboard. Kiểm tra RLS và migration.","error");}
 }
 function renderChart(orders){
  const now=new Date(),days=[];for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);d.setHours(0,0,0,0);days.push(d);}
  const vals=days.map(d=>orders.filter(o=>{const x=new Date(o.created_at);return dayKey(x)===dayKey(d)&&o.order_status!=="cancelled"}).reduce((s,o)=>s+Number(o.total_amount||0),0));
  const max=Math.max(...vals,1),pts=vals.map((v,i)=>[30+i*106,185-(v/max)*150]);
  const line=pts.map((p,i)=>(i?"L":"M")+p[0]+","+p[1]).join(" ");
  document.getElementById("chartLine").setAttribute("d",line);document.getElementById("chartArea").setAttribute("d",line+` L ${pts[6][0]} 200 L ${pts[0][0]} 200 Z`);
  document.getElementById("chartDots").innerHTML=pts.map(p=>`<circle class="admin-chart-dot" cx="${p[0]}" cy="${p[1]}" r="4"/>`).join("");
  document.getElementById("chartGrid").innerHTML=[35,85,135,185].map(y=>`<line class="admin-chart-grid" x1="20" x2="680" y1="${y}" y2="${y}"/>`).join("");
  document.getElementById("chartLabels").innerHTML=days.map(d=>`<span>${d.toLocaleDateString("vi-VN",{weekday:"short"})}</span>`).join("");
 }
 function renderBreakdown(orders){
  const statuses=["pending","confirmed","processing","shipped","delivered","cancelled"],total=Math.max(orders.length,1);
  document.getElementById("orderBreakdown").innerHTML=statuses.map(s=>{const n=orders.filter(o=>o.order_status===s).length;return `<div><div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:7px"><span>${ui.labels[s]}</span><b>${n}</b></div><div style="height:6px;border-radius:9px;background:rgba(255,255,255,.07);overflow:hidden"><div style="width:${n/total*100}%;height:100%;border-radius:9px;background:linear-gradient(90deg,#8b6bdb,#e3423b)"></div></div></div>`}).join("");
 }
 load();
})();
