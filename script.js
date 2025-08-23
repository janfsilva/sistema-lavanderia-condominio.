
const horarios = ["06h às 09h", "09h às 12h", "12h às 15h", "15h às 18h", "18h às 21h", "21h às 24h"];
const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function semanaSelecionada() {
  return document.getElementById("semana").value;
}

function gerarTabela() {
  const semana = semanaSelecionada();
  document.getElementById("titulo-semana").textContent = "Visualizando: " + semana;
  const corpo = document.getElementById("tabela-corpo");
  corpo.innerHTML = "";

  horarios.forEach(horario => {
    const row = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = horario;
    row.appendChild(th);

    dias.forEach(dia => {
      const td = document.createElement("td");
      let content = "";

      for (let i = 1; i <= 3; i++) {
        const chave = `${semana}_${dia}_${horario}_Lav${i}`;
        const registro = localStorage.getItem(chave);
        if (registro) {
          const dados = JSON.parse(registro);
          content += `
            🧺${i}: <span id="txt_${chave}">${dados.apto}</span>
            <button onclick="editar('${chave}')">✏️</button>
            <button onclick="remover('${chave}')">🗑️</button><br>`;
        }
      }

      td.innerHTML = content;
      if (content) td.classList.add("filled");
      row.appendChild(td);
    });

    corpo.appendChild(row);
  });
}

function agendar() {
  const semana = semanaSelecionada();
  const hoje = new Date();
  const diaSemana = hoje.getDay();

  if (semana === "S2" && diaSemana !== 6) {
    alert("⚠️ Semana 2 só pode ser agendada a partir do sábado da Semana 1.");
    return;
  }

  const lavadora = document.getElementById("lavadora").value.split(" ")[1];
  const morador = document.getElementById("morador").value.trim();
  const dia = document.getElementById("dia").value;
  const horario = document.getElementById("horario").value;
  if (!morador) return alert("Informe o número do apartamento!");

  for (let h of horarios) {
    for (let d of dias) {
      for (let i = 1; i <= 3; i++) {
        const chaveCheck = `${semana}_${d}_${h}_Lav${i}`;
        const registro = JSON.parse(localStorage.getItem(chaveCheck));
        if (registro && registro.apto === morador) {
          alert("Este apartamento já possui agendamento nesta semana.");
          return;
        }
      }
    }
  }

  const chave = `${semana}_${dia}_${horario}_Lav${lavadora}`;
  if (localStorage.getItem(chave)) return alert("Lavadora ocupada neste horário.");
  localStorage.setItem(chave, JSON.stringify({ apto: morador }));
  gerarTabela();
}

function editar(chave) {
  const atual = JSON.parse(localStorage.getItem(chave));
  const novoApto = prompt("Digite o novo número de apartamento:", atual.apto);
  if (!novoApto) return;
  atual.apto = novoApto;
  localStorage.setItem(chave, JSON.stringify(atual));
  gerarTabela();
}

function remover(chave) {
  if (confirm("Remover este agendamento?")) {
    localStorage.removeItem(chave);
    gerarTabela();
  }
}

function limparSemana() {
  const semana = prompt("Digite a semana a limpar (ex: S1 ou S2):");
  if (!semana || (semana !== "S1" && semana !== "S2")) {
    alert("Semana inválida.");
    return;
  }
  if (confirm(`Tem certeza que deseja limpar todos os agendamentos da ${semana}?`)) {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(semana + "_")) localStorage.removeItem(k);
    });
    gerarTabela();
  }
}

function exportarPDF() {
  const semana = semanaSelecionada();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Agenda - ${semana}`, 15, 10);
  let y = 20;

  horarios.forEach(h => {
    doc.text(`Horário: ${h}`, 15, y); y += 6;
    dias.forEach(d => {
      let linha = `${d}:`;
      for (let i = 1; i <= 3; i++) {
        const chave = `${semana}_${d}_${h}_Lav${i}`;
        const reg = JSON.parse(localStorage.getItem(chave));
        if (reg) linha += ` 🧺${i}: ${reg.apto};`;
      }
      doc.text(linha, 20, y); y += 6;
    });
    y += 4;
  });

  doc.save(`agenda_${semana}.pdf`);
}

document.addEventListener("DOMContentLoaded", gerarTabela);
