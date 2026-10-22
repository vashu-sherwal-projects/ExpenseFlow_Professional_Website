const KEY="expenseflow_transactions";
let transactions=JSON.parse(localStorage.getItem(KEY)||"[]");
const $=id=>document.getElementById(id);
const money=n=>"₹"+Number(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});

function save(){localStorage.setItem(KEY,JSON.stringify(transactions));render();}
function render(){
  const income=transactions.filter(x=>x.type==="Income").reduce((s,x)=>s+Number(x.amount),0);
  const expense=transactions.filter(x=>x.type==="Expense").reduce((s,x)=>s+Number(x.amount),0);
  $("income").textContent=money(income); $("expense").textContent=money(expense);
  $("balance").textContent=money(income-expense);
  $("savingRate").textContent=(income?Math.max(0,((income-expense)/income)*100):0).toFixed(0)+"%";
  renderTable(); renderCategories();
}
function renderTable(){
  const q=$("search").value.toLowerCase(), type=$("typeFilter").value;
  const rows=transactions.filter(x=>(type==="all"||x.type===type)&&(x.title+" "+x.category).toLowerCase().includes(q))
    .sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  $("transactionBody").innerHTML=rows.map(x=>`<tr>
    <td><span class="tx-title">${escapeHtml(x.title)}</span></td>
    <td><span class="tx-cat">${escapeHtml(x.category)}</span></td>
    <td>${x.date}</td>
    <td class="amount ${x.type==="Income"?"income-text":"expense-text"}">${x.type==="Income"?"+":"−"}${money(x.amount)}</td>
    <td><button class="delete" onclick="removeTx('${x.id}')" title="Delete">×</button></td>
  </tr>`).join("");
  $("empty").style.display=rows.length?"none":"block";
}
function renderCategories(){
  const map={}; transactions.filter(x=>x.type==="Expense").forEach(x=>map[x.category]=(map[x.category]||0)+Number(x.amount));
  const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,6), max=entries[0]?.[1]||1;
  $("categoryChart").innerHTML=entries.length?entries.map(([k,v])=>`<div class="bar-wrap"><div class="bar" style="height:${Math.max(5,v/max*145)}px" title="${money(v)}"></div><span class="bar-label">${escapeHtml(k)}</span></div>`).join(""):"<div style='margin:auto;color:#9aa3b5;font-size:12px'>Add expenses to see your chart</div>";
  $("categoryList").innerHTML=entries.map(([k,v])=>`<div class="category-row"><span>${escapeHtml(k)}</span><b>${money(v)}</b></div>`).join("");
}
function removeTx(id){transactions=transactions.filter(x=>String(x.id)!==String(id));save();}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

$("openModal").onclick=()=>{$("modal").classList.add("show");$("date").value=new Date().toISOString().slice(0,10);};
$("closeModal").onclick=()=>$("modal").classList.remove("show");
$("modal").onclick=e=>{if(e.target===$("modal"))$("modal").classList.remove("show");};
$("search").oninput=renderTable; $("typeFilter").onchange=renderTable;
$("transactionForm").onsubmit=e=>{
  e.preventDefault();
  const t={id:Date.now(),type:document.querySelector('input[name="type"]:checked').value,title:$("title").value.trim(),amount:Number($("amount").value),category:$("category").value,date:$("date").value};
  transactions.push(t); save(); e.target.reset(); $("date").value=new Date().toISOString().slice(0,10); $("modal").classList.remove("show");
};
render();
