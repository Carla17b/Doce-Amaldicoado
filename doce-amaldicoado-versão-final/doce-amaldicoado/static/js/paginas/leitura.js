// Página de leitura: serve qualquer etapa listada em ETAPAS (app.py). A etapa é o final do endereço.
import { api } from "../core/api.js";
import { carregarDados } from "../core/dados.js";
import { aplicarFicha, aplicarFinais, aplicarPistas, contextoDaFicha } from "../core/ficha.js";
import { criarLeitor, paraMinutos } from "../core/leitor.js";
import { iniciarSom } from "../core/som.js";

const etapa = location.pathname.split("/").filter(Boolean).pop();

const [dados, { progresso }, { detetive }, { pistas: encontradas }, catalogo, { finais }] = await Promise.all([
  carregarDados(etapa),
  api(`/api/progresso/${etapa}`),
  api("/api/detetive"),
  api("/api/pistas"),
  carregarDados("pistas"),
  api("/api/finais"),
]);
document.title = `${dados.titulo} · O doce amaldiçoado`;

// Retoma de onde parou; se já tinha chegado ao fim, começa de novo.
const salvo = progresso?.estado;
const retomar = salvo && dados.cenas[salvo.cena] && !dados.cenas[salvo.cena].fim;
const estado = retomar ? salvo : { cena: dados.inicio, marcas: [], hora: null };

// Numa partida nova, herda a hora e as marcas da etapa anterior (ex.: quem já conversou com quem).
if (!retomar && dados.herdaDe) {
  const { progresso: anterior } = await api(`/api/progresso/${dados.herdaDe}`);
  if (anterior) {
    estado.hora = anterior.estado.hora;
    estado.marcas = anterior.estado.marcas.filter((m) => !m.startsWith("pista_"));
  }
}
if (!estado.hora && dados.horaInicial) estado.hora = paraMinutos(dados.horaInicial);

aplicarFicha(estado, detetive);
aplicarPistas(estado, encontradas);
aplicarFinais(estado, finais);

iniciarSom({ topo: document.querySelector(".cena-topo") });

const salvar = (concluida = false) =>
  api(`/api/progresso/${etapa}`, { metodo: "POST", corpo: { estado, concluida } }).catch(() => {});

criarLeitor({
  cenas: dados.cenas,
  estado,
  contexto: contextoDaFicha(detetive),
  limite: dados.limite,
  catalogoPistas: catalogo,
  confrontos: dados.confrontos,
  elementos: {
    local: document.getElementById("cena-local"),
    hora: document.getElementById("cena-hora"),
    cenario: document.getElementById("cena-cenario"),
    texto: document.getElementById("cena-texto"),
    escolhas: document.getElementById("cena-escolhas"),
  },
  aoEntrar: () => salvar(),
  aoFim: () => salvar(true),
  aoPista: (id) => api(`/api/pistas/${id}`, { metodo: "POST" }).catch(() => {}),
  aoFinal: (id) => {
    api(`/api/finais/${id}`, { metodo: "POST" }).catch(() => {});
    salvar(true); // chegar a um final conclui a etapa
  },
}).iniciar();
