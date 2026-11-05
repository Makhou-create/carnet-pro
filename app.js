
// Carnet Pro — prototype local
const customers = [
  {id:1,name:"Amadou Ndiaye",phone:"77 000 00 01",credit:25000,paid:10000},
  {id:2,name:"Moussa Fall",phone:"76 000 00 02",credit:18000,paid:18000},
  {id:3,name:"Fatou Diop",phone:"78 000 00 03",credit:30000,paid:15000},
  {id:4,name:"Ibrahima Ba",phone:"70 000 00 04",credit:12000,paid:0}
];

let nextId = 5;
const money = n => new Intl.NumberFormat("fr-FR").format(n);
const list = document.getElementById("customerList");
const customerDialog = document.getElementById("customerDialog");
const creditDialog = document.getElementById("creditDialog");
const paymentDialog = document.getElementById("paymentDialog");
const customerDetailDialog = document.getElementById("customerDetailDialog");
const toast = document.getElementById("toast");

function notify(message){
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2300);
}

function totals(){
  const credits=customers.reduce((s,c)=>s+c.credit,0);
  const paid=customers.reduce((s,c)=>s+c.paid,0);
  document.getElementById("totalCredits").textContent=money(credits);
  document.getElementById("totalPayments").textContent=money(paid);
  document.getElementById("remainingBalance").textContent=money(credits-paid)+" FCFA";
}

function renderCustomers(filter=""){
  const filtered=customers.filter(c=>c.name.toLowerCase().includes(filter.toLowerCase()) || c.phone.includes(filter));
  list.innerHTML="";
  if(!filtered.length){
    list.innerHTML='<div class="empty-state">Aucun client trouvé.</div>';
    return;
  }
  filtered.forEach(c=>{
    const balance=c.credit-c.paid;
    const initials=c.name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();
    const row=document.createElement("article");
    row.className="customer-row";
    row.dataset.customerId = c.id;
    row.innerHTML=`<div class="avatar">${initials}</div><div class="customer-info"><strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.phone||"Téléphone non renseigné")}</small></div><div class="customer-right"><strong>${money(balance)} F</strong><span class="status ${balance>0?"due":"paid"}">${balance>0?"À rembourser":"Soldé"}</span><div class="row-actions">${balance>0?'<button class="mini-button" data-pay="'+c.id+'">＋ Paiement</button>':""}<button class="mini-button" data-remind="${c.id}">WhatsApp</button></div></div>`;
    list.appendChild(row);
  });
}

function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}

function fillCustomerSelect(){
  const select=document.getElementById("creditCustomer");
  select.innerHTML=customers.map(c=>`<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("");
}

document.getElementById("addCustomerBtn").addEventListener("click",()=>customerDialog.showModal());

document.getElementById("addCreditBtn").addEventListener("click",()=>{
  if(!customers.length){notify("Ajoutez d'abord un client.");return;}
  fillCustomerSelect();
  creditDialog.showModal();
});

document.getElementById("customerForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  customers.unshift({id:nextId++,name:f.get("name").trim(),phone:f.get("phone").trim(),credit:0,paid:0});
  e.currentTarget.reset();
  customerDialog.close();
  renderCustomers(document.getElementById("searchInput").value);
  totals();
  notify("Client ajouté.");
});

document.getElementById("creditForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  const c=customers.find(x=>x.id===Number(f.get("customerId")));
  const amount=Number(f.get("amount"));
  if(!c||amount<=0)return;
  c.credit+=amount;
  e.currentTarget.reset();
  creditDialog.close();
  renderCustomers(document.getElementById("searchInput").value);
  totals();
  notify("Crédit enregistré.");
});

list.addEventListener("click",e=>{
  const pay=e.target.closest("[data-pay]");
  const remind=e.target.closest("[data-remind]");
  if(pay){
    const c=customers.find(x=>x.id===Number(pay.dataset.pay));
    const form=document.getElementById("paymentForm");
    form.elements.customerId.value=c.id;
    form.elements.amount.max=c.credit-c.paid;
    document.getElementById("paymentHelp").textContent="Solde restant : "+money(c.credit-c.paid)+" FCFA";
    document.getElementById("paymentTitle").textContent="Paiement de "+c.name;
    paymentDialog.showModal();
  }
  if(remind){
    const c=customers.find(x=>x.id===Number(remind.dataset.remind));
    const balance=c.credit-c.paid;
    if(!c.phone){notify("Ajoutez le numéro du client pour WhatsApp.");return;}
    const phone=c.phone.replace(/\D/g,"");
    const message=`Bonjour ${c.name}, petit rappel concernant votre solde de ${money(balance)} FCFA. Merci et bonne journée.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,"_blank");
  }
});

document.getElementById("paymentForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  const c=customers.find(x=>x.id===Number(f.get("customerId")));
  const amount=Number(f.get("amount"));
  if(!c||amount<=0||amount>c.credit-c.paid){
    notify("Montant de paiement invalide.");
    return;
  }
  c.paid+=amount;
  e.currentTarget.reset();
  paymentDialog.close();
  renderCustomers(document.getElementById("searchInput").value);
  totals();
  notify("Remboursement enregistré.");
});

document.getElementById("searchInput").addEventListener("input",e=>renderCustomers(e.target.value));

document.getElementById("seeAllBtn").addEventListener("click",()=>{
  document.getElementById("searchInput").value="";
  renderCustomers();
  notify("Tous les clients affichés.");
});

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  if(btn.dataset.view!=="home")notify("Cette rubrique sera développée dans la prochaine étape.");
}));

totals();
renderCustomers();
  
