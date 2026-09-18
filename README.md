# O Doce Amaldiçoado

> **Curso:** Técnico em Informática / Análise e Desenvolvimento de Sistemas  
> **Disciplina:** Engenharia de Software e Projeto Interdisciplinar II  
> **Turma:** INF08-M  

---

## Resumo do Projeto

**O Doce Amaldiçoado** é uma aplicação web interativa de investigação e suspense psicológico. Ambientado em uma mansão isolada na serra durante uma tempestade de neve, o jogo coloca o jogador no papel de Ícaro após a morte por envenenamento de Mateus — o anfitrião que mantinha seus convidados sob chantagem por causa de um crime ocorrido três anos antes.

O projeto combina elementos de *Visual Novel*, exploração por planta baixa e dedução por mural de evidências, operando totalmente client-side e com integração a modelos de IA para interrogatórios em tempo real.

---

## Integrantes do Grupo

* **Angélica Cristina Pereira de Assis** — *Diagramas e Slides*
* **Carla Rodrigues Castelo** — *Código e Documentação*
* **Ícaro dos Santos Costa** — *Diagramas e Slides*
* **Laís Fernanda Alves Cruz** — *Documentação*
* **Mariane de Moraes e Souza** — *Documentação*
* **Mateus Vitor Augusto dos Santos** — *Pesquisa e Banco de Dados*

### Orientador
* **Prof. Emmanuel Vinicius Martins**

---

## Bibliotecas e Tecnologias Utilizadas

| Tecnologia / Biblioteca | Versão | Função no Projeto |
| :--- | :--- | :--- |
| **HTML5 / CSS3** | Standard | Estrutura semântica, layout responsivo e estilização visual *Noir*. |
| **JavaScript (ES6+)** | Native | Lógica do jogo, gerenciador de estado, temporizador e manipulação do DOM. |
| **Google Fonts (Special Elite & Lora)** | Web API | Identidade tipográfica (máquina de escrever e texto clássico). |
| **Web Storage API (localStorage)** | Native | Persistência local de cadastros, login e progresso do jogador. |
| **SVG (Scalable Vector Graphics)** | Native | Renderização da planta baixa interativa e retratos dos personagens. |
| **Claude API / AI SDK (Opcional)** | Quick Tier | Processamento de linguagem natural nos interrogatórios em tempo real. |

---

## Estrutura de Pastas

```text
Doce-Amaldicoado/
│
├── index.html            # Arquivo principal (Aplicação Monolítica Client-Side)
├── README.md             # Documentação do repositório
│
├── assets/               # Recursos visuais e mídias
│   ├── images/           # Capturas de tela e mockups da interface
│   └── diagrams/         # Diagramas de Classes e Casos de Uso (UML)
│
└── docs/                 # Documentação técnica do projeto
    ├── requisitos.md     # Requisitos Funcionais, Não Funcionais e Restrições
    └── apresentacao.pdf  # Slides de apresentação do projeto
