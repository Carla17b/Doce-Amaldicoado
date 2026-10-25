// Traduz a ficha do detetive em "marcas" que as cenas podem testar (ex.: esp_pessoas, passado_policial).
const PREFIXOS = ["esp_", "passado_"];

export function aplicarFicha(estado, detetive) {
  estado.marcas = estado.marcas.filter((m) => !PREFIXOS.some((p) => m.startsWith(p)));
  estado.marcas.push(`esp_${detetive.especialidade}`, `passado_${detetive.passado}`);
}

// As pistas que já estão no banco viram marcas "pista_<id>", para as cenas esconderem o que já foi achado.
export function aplicarPistas(estado, ids) {
  estado.marcas = estado.marcas.filter((m) => !m.startsWith("pista_"));
  estado.marcas.push(...ids.map((id) => `pista_${id}`));
}

// Os finais já alcançados viram marcas "final_<n>", para a tela de placar mostrá-los.
export function aplicarFinais(estado, ids) {
  estado.marcas = estado.marcas.filter((m) => !m.startsWith("final_"));
  estado.marcas.push(...ids.map((id) => `final_${id}`));
}

export function contextoDaFicha(detetive) {
  const nome = detetive.nome.split(/\s+/)[0];
  return { nome, codinome: detetive.codinome || nome };
}
