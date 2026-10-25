// Música do jogo: uma musiquinha de suspense gerada no próprio navegador (Web Audio API).
// Não usa arquivos de áudio, chaves de API nem internet: funciona em qualquer plataforma.
//
// Toca durante toda a leitura, sem mudar de uma cena para outra.
// O jogador silencia pelo botão "Som" no topo; a escolha fica guardada no navegador.
//
// Para ajustar: VOLUME_MUSICA (mais alto ou mais baixo), ESCALA (as notas) e o intervalo entre
// notas (últimos números de agendarNota).
import { el } from "./dom.js";

const CHAVE = "doce_som"; // guarda "off" quando o jogador silencia
const VOLUME_MUSICA = 0.27;

// Lá menor harmônica: poucas notas de caixa de música, com eco, que dão o clima de suspense.
const ESCALA = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 415.3, 440, 493.88, 523.25, 659.25];

const sorteio = (min, max) => min + Math.random() * (max - min);

// Cria o botão "Som" dentro de "topo".
export function iniciarSom({ topo }) {
  const Contexto = window.AudioContext ?? window.webkitAudioContext;
  let ctx = null;
  let entrada = null; // por aqui entram as notas
  let timer = null;
  let posicao = 4; // nota atual na ESCALA
  let ligado = true;
  try { ligado = localStorage.getItem(CHAVE) !== "off"; } catch { /* navegador sem armazenamento */ }

  const botao = el("button", { classe: "sair botao-simples", type: "button", title: "Liga ou desliga a música" });
  const rotular = () => { botao.textContent = ligado ? "Som: ligado" : "Som: desligado"; };
  rotular();
  topo.insertBefore(botao, topo.querySelector(".sair"));
  if (!Contexto) { botao.hidden = true; return; }

  const ganho = (valor) => {
    const g = ctx.createGain();
    g.gain.value = valor;
    return g;
  };

  function tocarNota() {
    if (ctx.state !== "running") return;
    posicao = Math.max(0, Math.min(ESCALA.length - 1, posicao + Math.round(sorteio(-2, 2))));
    const t = ctx.currentTime;
    const envelope = ganho(0.0001);
    envelope.gain.setValueAtTime(0.0001, t);
    envelope.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    envelope.connect(entrada);
    for (const [multiplo, peso] of [[1, 1], [2, 0.25]]) { // a nota e um harmônico mais agudo
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = ESCALA[posicao] * multiplo;
      const g = ganho(peso);
      o.connect(g);
      g.connect(envelope);
      o.start(t);
      o.stop(t + 2.5);
    }
  }

  function agendarNota(espera) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      tocarNota();
      agendarNota(sorteio(2200, 5200));
    }, espera);
  }

  function ligarAudio() {
    if (!ctx) {
      ctx = new Contexto();
      const saida = ganho(VOLUME_MUSICA);
      const eco = ctx.createDelay(2);
      eco.delayTime.value = 0.46;
      const retorno = ganho(0.45);
      entrada = ganho(1);
      eco.connect(retorno);
      retorno.connect(eco);
      eco.connect(saida);
      entrada.connect(saida);
      entrada.connect(eco);
      saida.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    if (!timer) agendarNota(sorteio(500, 1500));
  }

  function silenciar() {
    clearTimeout(timer);
    timer = null;
    if (ctx) ctx.suspend().catch(() => {});
  }

  botao.addEventListener("click", () => {
    ligado = !ligado;
    try { localStorage.setItem(CHAVE, ligado ? "on" : "off"); } catch { /* ignora */ }
    rotular();
    if (ligado) ligarAudio(); else silenciar();
  });

  // Os navegadores só deixam tocar som depois de um clique ou tecla do jogador.
  const gestos = ["pointerdown", "keydown"];
  const aoPrimeiroGesto = () => {
    gestos.forEach((g) => document.removeEventListener(g, aoPrimeiroGesto, true));
    if (ligado) ligarAudio();
  };
  gestos.forEach((g) => document.addEventListener(g, aoPrimeiroGesto, true));
  if (ligado && navigator.userActivation?.hasBeenActive) aoPrimeiroGesto();

  // Aba em segundo plano: pausa a música.
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !ligado) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });
}
