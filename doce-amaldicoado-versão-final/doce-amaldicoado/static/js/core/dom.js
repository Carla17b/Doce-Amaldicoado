// Cria elementos sem usar innerHTML (evita injetar texto digitado pelo jogador como HTML).
export function el(tag, atributos = {}, ...filhos) {
  const no = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos)) {
    if (valor === false || valor == null) continue;
    if (chave === "classe") no.className = valor;
    else if (valor === true) no.setAttribute(chave, "");
    else no.setAttribute(chave, valor);
  }
  no.append(...filhos.filter((filho) => filho != null && filho !== false));
  return no;
}
