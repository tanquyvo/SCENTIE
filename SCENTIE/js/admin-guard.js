(function () {
 "use strict";
 const client=window.scentieSupabase;
 if(!client){console.error("[SCENTIE ADMIN] Supabase client missing");document.body.innerHTML='<p style="padding:30px;color:white">Không thể kết nối Supabase. Vui lòng tải lại.</p>';return;}
 document.documentElement.style.visibility="hidden";
 const logout=document.getElementById("adminLogoutButton");
 async function guard(){
  try{
   const {data:{session},error}=await client.auth.getSession();
   if(error)throw error;
   if(!session){location.replace("./login.html");return;}
   const {data:isAdmin,error:roleError}=await client.rpc("is_admin");
   if(roleError)throw roleError;
   if(isAdmin!==true){await client.auth.signOut();location.replace("./login.html");return;}
   const email=session.user?.email||"Administrator";
   const label=document.getElementById("adminUserLabel");
   const avatar=document.getElementById("adminAvatar");
   if(label)label.textContent=email;
   if(avatar)avatar.textContent=(email[0]||"A").toUpperCase();
   document.documentElement.style.visibility="visible";
  }catch(error){console.error("[SCENTIE ADMIN] Guard failed:",error);document.documentElement.style.visibility="visible";document.body.innerHTML='<main style="padding:40px;color:#fff;font-family:Arial"><h2>Không thể xác minh quyền Admin</h2><p>Kiểm tra kết nối Supabase rồi tải lại trang.</p><a href="./login.html" style="color:#ff918b">Quay lại đăng nhập</a></main>';}
 }
 if(logout)logout.addEventListener("click",async()=>{logout.disabled=true;try{const {error}=await client.auth.signOut();if(error)throw error;location.replace("./login.html");}catch(error){console.error(error);logout.disabled=false;window.adminToast?.("Đăng xuất thất bại","error");}});
 client.auth.onAuthStateChange(event=>{if(event==="SIGNED_OUT")location.replace("./login.html");});
 guard();
})();
