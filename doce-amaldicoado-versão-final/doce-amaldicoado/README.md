# O doce amaldiçoado

Jogo de investigação em HTML, CSS e JavaScript. O Python (Flask + SQLite) cuida só de contas, progresso, pistas e finais.

## Como rodar

```
pip install -r requirements.txt
python app.py
```

Abra http://127.0.0.1:5000. Não abra os HTML direto no navegador: as páginas dependem do servidor.
Em produção, defina a variável de ambiente `SECRET_KEY` com um valor longo e aleatório.

A página inicial (`/`) é pública: apresenta o jogo e leva ao cadastro (`/login#cadastro`) ou ao login. Quem já está logado vê "Continuar o caso".

## Como o projeto está organizado

```
app.py                 rotas: páginas e API (contas, ficha, progresso, pistas, finais)
banco.py               tabelas do SQLite
data/                  A HISTÓRIA (só texto e regras, sem lógica)
  prologo.json  convite.json  mansao.json  jantar.json
  noite.json  interrogatorios.json  acusacao.json      uma etapa de leitura cada
  pistas.json          catálogo das pistas do caderno (o total "X de 30" vem daqui)
  ligacoes.json        ligações entre pistas, usadas pelo botão de dica do caderno
  finais.json          títulos dos 5 finais
  detetive.json        retratos, especialidades e passados
  capitulos.json       o que o menu mostra
paginas/               inicio (apresentação), login, detetive (ficha), menu, caderno, creditos e leitura (serve todas as etapas)
static/css/            base, componentes e um CSS por página
static/js/core/        leitor.js (motor de cenas), som.js (música), api.js, dados.js, ficha.js, dom.js
static/js/paginas/     um JS por página
static/img/            retratos e cenários (SVG)
```

## Ordem do jogo

prólogo → convite → mansão → jantar → noite presa → interrogatórios → acusação → um dos 5 finais.

## Como acrescentar uma etapa nova

1. Crie `data/minha_etapa.json` (veja o formato no comentário do topo de `static/js/core/leitor.js`).
2. Acrescente `"minha_etapa"` em `ETAPAS`, no `app.py`.
3. Liste a etapa em `data/capitulos.json`.

Não é preciso criar HTML nem JS: a página `leitura` serve qualquer etapa.

## Como mudar a história

Edite os JSON em `data/`. O motor não conhece a história: ele só lê cenas, escolhas, marcas e pistas.
- Uma **marca** (`marcar`, `se`, `sem`) é um "lembrete" que decide o que aparece depois.
- Uma **pista** (`pista`) vai para o caderno e é salva no banco.
- Os **confrontos** dos interrogatórios ficam em `confrontos`, em `data/interrogatorios.json`.
- O **final** é decidido pelos desvios (`roteia`) em `data/acusacao.json`.

## Dicas para o jogador

- **Caderno:** mostra "X de 30 pistas", por caso, com espaços "?" para as que faltam. O botão "Pedir uma dica" revela uma ligação por clique,
  só entre pistas que o jogador já achou. Quais ligações existem está em `data/ligacoes.json`; as já reveladas ficam guardadas no navegador.
- **Ao apresentar pistas:** o botão "Dica" tem dois níveis. O primeiro destaca as pistas do jogador que têm a ver com aquela pessoa; o segundo
  sugere a combinação (ou diz o que falta e onde procurar). A dica é calculada a partir de `confrontos` em `data/interrogatorios.json`, não custa
  tempo e nunca revela o nome de uma pista que o jogador ainda não tem.
- Se acrescentar uma pista nova ao jogo, inclua-a em `data/pistas.json` e, se ela se ligar a outras, em `data/ligacoes.json`.

## Música

A musiquinha de suspense é gerada no navegador (Web Audio API), então não há arquivos de áudio, chaves de API nem internet envolvidos.
- `static/js/core/som.js` cria as notas (caixa de música em lá menor, com eco). Toca em todas as cenas de leitura, sem mudar.
- Para ajustar, edite no topo do arquivo `VOLUME_MUSICA` (volume) e `ESCALA` (as notas).
- O botão "Som" no topo da leitura liga e desliga a música; a escolha fica guardada no navegador do jogador.
- O navegador só libera o som depois do primeiro clique ou tecla do jogador, então a música começa na primeira interação.

## Créditos

A tela de créditos (`/creditos`) é a página `paginas/creditos.html`. O nome do grupo, os integrantes e o agradecimento ficam direto nesse HTML (troque "Nome do grupo").
Ela é aberta pelo botão "Ver os créditos" da tela dos finais (cena `placar`, em `data/acusacao.json`).

## Replit

- Rode pelo botão **Run** (o `.replit` já manda executar `python app.py`). No Replit o app liga em `0.0.0.0` e sem depurador.
- Em **Secrets**, crie `SECRET_KEY` com um valor longo e aleatório.
- O banco (`doce_amaldicoado.db`) fica na pasta do projeto: no editor ele permanece entre execuções, mas num app **publicado (Deployment)** os arquivos gravados somem a cada novo deploy ou reinício, e as contas voltam do zero.
- No computador, mantenha uma pasta só: cada pasta nova tem um banco novo (e vazio).
