import { api } from "../core/api.js";
import { carregarDados, urlRetrato } from "../core/dados.js";
import { el } from "../core/dom.js";

const [{ detetive }, opcoes, capitulos, { finais: alcancados }, todosFinais] = await Promise.all([
  api("/api/detetive"),
  carregarDados("detetive"),
  carregarDados("capitulos"),
  api("/api/finais"),
  carregarDados("finais"),
]);

// Progresso de cada etapa de leitura (prólogo, convite...), indexado pelo id da etapa.
const todasEtapas = capitulos.flatMap((c) => c.etapas);
const progressos = Object.fromEntries(
  await Promise.all(todasEtapas.map(async (e) => [e.id, (await api(`/api/progresso/${e.id}`)).progresso])),
);

const achar = (lista, id) => lista.find((item) => item.id === id);

// ---- Crachá do detetive ----
function pintarCracha() {
  const especialidade = achar(opcoes.especialidades, detetive.especialidade);
  const passado = achar(opcoes.passados, detetive.passado);

  document.getElementById("cracha").append(
    el("div", { classe: "foto" }, el("img", { src: urlRetrato(detetive.retrato), alt: "" })),
    el("div", {},
      el("h2", {}, detetive.nome),
      detetive.codinome ? el("p", { classe: "codinome" }, `“${detetive.codinome}”`) : null,
      el("dl", {},
        el("dt", {}, "Especialidade"), el("dd", {}, especialidade.nome),
        el("dt", {}, "Passado"), el("dd", {}, passado.nome),
      ),
    ),
  );
}

// ---- Casos ----
// Nenhum capítulo inteiro foi concluído ainda (só o prólogo existe); isto passará a vir do banco.
const concluidos = new Set();

function pintarCaso(capitulo) {
  const lacrado = capitulo.requer !== null && !concluidos.has(capitulo.requer);
  const disponivel = !lacrado && capitulo.pronto;

  const feitas = capitulo.etapas.filter((e) => progressos[e.id]?.concluida);
  const proxima = capitulo.etapas.find((e) => !progressos[e.id]?.concluida);
  const comecou = capitulo.etapas.some((e) => progressos[e.id]);

  let rodape;
  if (lacrado) {
    rodape = el("p", { classe: "nota" }, `Só abre depois de resolver o capítulo ${capitulo.requer}.`);
  } else if (!disponivel) {
    rodape = el("p", { classe: "nota" }, "Este capítulo ainda está sendo escrito.");
  } else {
    rodape = el("div", {},
      proxima ? el("a", { classe: "botao", href: proxima.rota }, comecou ? "Continuar" : "Começar o caso") : null,
      capitulo.completo === false
        ? el("p", { classe: "nota" }, "O resto deste capítulo ainda está sendo escrito.") : null,
      !proxima && capitulo.completo
        ? el("p", { classe: "nota" }, "Você chegou ao fim desta história. Revisite qualquer parte abaixo, ou tente outra acusação.") : null,
      feitas.length
        ? el("p", { classe: "revisar" }, "Rever: ", ...feitas.flatMap((e, i) => [
            i ? ", " : null, el("a", { href: e.rota }, e.titulo)])) : null,
    );
  }

  return el("article", { classe: lacrado ? "caso lacrado" : "caso" },
    lacrado ? el("span", { classe: "carimbo" }, "Lacrado") : null,
    el("h2", {}, `${capitulo.rotulo ?? `Capítulo ${capitulo.id}`}: ${capitulo.titulo}`),
    el("p", {}, capitulo.resumo),
    rodape,
  );
}

function pintarFinais() {
  document.getElementById("cracha").append(
    el("div", { classe: "finais" },
      el("h3", {}, `Finais: ${alcancados.length} de ${todosFinais.length}`),
      el("ul", {}, ...todosFinais.map((f) =>
        el("li", { classe: alcancados.includes(f.id) ? "feito" : "" }, alcancados.includes(f.id) ? f.titulo : "Final não descoberto"))),
    ));
}

pintarCracha();
pintarFinais();
document.getElementById("casos").append(...capitulos.map(pintarCaso));

document.getElementById("sair").addEventListener("click", async () => {
  await api("/api/logout", { metodo: "POST" });
  window.location.href = "/login";
});
