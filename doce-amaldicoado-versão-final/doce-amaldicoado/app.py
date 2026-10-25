"""Servidor do jogo: entrega as páginas e responde à API. A história fica em /data."""
import json
import os
import re
import sqlite3
from functools import wraps
from pathlib import Path

from flask import Flask, abort, jsonify, redirect, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash

import banco

BASE = Path(__file__).resolve().parent
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

app = Flask(__name__, static_folder=str(BASE / "static"), static_url_path="/static")
app.config.update(
    SECRET_KEY=os.environ.get("SECRET_KEY", "troque-esta-chave-em-producao"),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SEND_FILE_MAX_AGE_DEFAULT=0,  # sem cache durante o desenvolvimento
)
banco.inicializar()


# ---------- sessão ----------
def usuario_atual():
    user_id = session.get("usuario_id")
    if not user_id:
        return None
    with banco.conectar() as db:
        return db.execute(
            "SELECT id, nome, email FROM usuarios WHERE id = ?", (user_id,)
        ).fetchone()


def usuario_json(u):
    return {"id": u["id"], "nome": u["nome"], "email": u["email"]}


def exigir_login(funcao):
    @wraps(funcao)
    def protegida(*args, **kwargs):
        if usuario_atual() is None:
            return jsonify({"erro": "Entre na sua conta para continuar."}), 401
        return funcao(*args, **kwargs)

    return protegida


# ---------- dados da história (arquivos em /data) ----------
ETAPAS = {"prologo", "convite", "mansao", "jantar", "noite", "interrogatorios", "acusacao"}  # trechos de leitura do jogo: cada um tem um JSON em /data e progresso salvo
DADOS_PUBLICOS = {"detetive", "capitulos", "pistas", "finais", "ligacoes"} | ETAPAS


def carregar_dados(nome):
    return json.loads((BASE / "data" / f"{nome}.json").read_text(encoding="utf-8"))


def buscar_detetive(user_id):
    with banco.conectar() as db:
        linha = db.execute(
            "SELECT nome, codinome, retrato, especialidade, passado FROM detetives WHERE usuario_id = ?",
            (user_id,),
        ).fetchone()
    return dict(linha) if linha else None


# ---------- páginas ----------
def pagina(nome):
    return send_from_directory(BASE / "paginas", f"{nome}.html")


@app.get("/")
def inicio():
    return pagina("inicio")  # apresentação pública do jogo, com botões para cadastro e login


@app.get("/login")
def pagina_login():
    if usuario_atual():
        return redirect("/menu")
    return pagina("login")


@app.get("/menu")
def pagina_menu():
    u = usuario_atual()
    if not u:
        return redirect("/login")
    if not buscar_detetive(u["id"]):
        return redirect("/detetive")  # primeiro acesso: cria a ficha antes
    return pagina("menu")


@app.get("/creditos")
def pagina_creditos():
    return pagina("creditos")  # tela final: nome do grupo e agradecimento


@app.get("/detetive")
def pagina_detetive():
    if not usuario_atual():
        return redirect("/login")
    return pagina("detetive")


@app.get("/caderno")
def pagina_caderno():
    if not usuario_atual():
        return redirect("/login")
    return pagina("caderno")


@app.get("/<etapa>")
def pagina_etapa(etapa):
    if etapa not in ETAPAS:
        abort(404)
    u = usuario_atual()
    if not u:
        return redirect("/login")
    if not buscar_detetive(u["id"]):
        return redirect("/detetive")
    return pagina("leitura")  # todas as etapas usam a mesma página de leitura


# ---------- API: conta ----------
@app.get("/api/sessao")
def api_sessao():
    u = usuario_atual()
    return jsonify({"usuario": usuario_json(u) if u else None})


@app.post("/api/cadastro")
def api_cadastro():
    dados = request.get_json(silent=True) or {}
    nome = str(dados.get("nome", "")).strip()
    email = str(dados.get("email", "")).strip().lower()
    senha = str(dados.get("senha", ""))

    if not nome:
        return jsonify({"erro": "Escreva seu nome."}), 400
    if len(nome) > 100:
        return jsonify({"erro": "O nome pode ter no máximo 100 caracteres."}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"erro": "Esse e-mail não parece válido."}), 400
    if len(senha) < 6:
        return jsonify({"erro": "A senha precisa de pelo menos 6 caracteres."}), 400

    try:
        with banco.conectar() as db:
            cursor = db.execute(
                "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
                (nome, email, generate_password_hash(senha)),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Já existe uma conta com esse e-mail."}), 409

    session.clear()
    session["usuario_id"] = user_id
    return jsonify({"usuario": {"id": user_id, "nome": nome, "email": email}}), 201


@app.post("/api/login")
def api_login():
    dados = request.get_json(silent=True) or {}
    email = str(dados.get("email", "")).strip().lower()
    senha = str(dados.get("senha", ""))

    with banco.conectar() as db:
        u = db.execute(
            "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?", (email,)
        ).fetchone()

    if not u or not check_password_hash(u["senha_hash"], senha):
        return jsonify({"erro": "E-mail ou senha não conferem."}), 401

    session.clear()
    session["usuario_id"] = u["id"]
    return jsonify({"usuario": usuario_json(u)})


@app.post("/api/logout")
def api_logout():
    session.clear()
    return jsonify({"ok": True})


# ---------- API: dados e detetive ----------
@app.get("/api/dados/<nome>")
def api_dados(nome):
    if nome not in DADOS_PUBLICOS:
        return jsonify({"erro": "Arquivo não encontrado."}), 404
    return jsonify(carregar_dados(nome))


@app.get("/api/detetive")
@exigir_login
def api_detetive():
    return jsonify({"detetive": buscar_detetive(session["usuario_id"])})


@app.post("/api/detetive")
@exigir_login
def api_salvar_detetive():
    dados = request.get_json(silent=True) or {}
    opcoes = carregar_dados("detetive")

    nome = str(dados.get("nome", "")).strip()
    codinome = str(dados.get("codinome", "")).strip()
    retrato = str(dados.get("retrato", ""))
    especialidade = str(dados.get("especialidade", ""))
    passado = str(dados.get("passado", ""))

    def ids(chave):
        return {item["id"] for item in opcoes[chave]}

    if not nome:
        return jsonify({"erro": "Escreva o nome do detetive."}), 400
    if len(nome) > 40:
        return jsonify({"erro": "O nome pode ter no máximo 40 caracteres."}), 400
    if len(codinome) > 30:
        return jsonify({"erro": "O codinome pode ter no máximo 30 caracteres."}), 400
    if retrato not in ids("retratos"):
        return jsonify({"erro": "Escolha um retrato."}), 400
    if especialidade not in ids("especialidades"):
        return jsonify({"erro": "Escolha uma especialidade."}), 400
    if passado not in ids("passados"):
        return jsonify({"erro": "Escolha um passado."}), 400

    with banco.conectar() as db:
        db.execute(
            """
            INSERT INTO detetives (usuario_id, nome, codinome, retrato, especialidade, passado)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(usuario_id) DO UPDATE SET
                nome = excluded.nome, codinome = excluded.codinome, retrato = excluded.retrato,
                especialidade = excluded.especialidade, passado = excluded.passado,
                atualizado_em = CURRENT_TIMESTAMP
            """,
            (session["usuario_id"], nome, codinome, retrato, especialidade, passado),
        )
    return jsonify({"detetive": buscar_detetive(session["usuario_id"])})


# ---------- API: pistas ----------
@app.get("/api/pistas")
@exigir_login
def api_pistas():
    with banco.conectar() as db:
        linhas = db.execute(
            "SELECT pista_id FROM pistas_encontradas WHERE usuario_id = ? ORDER BY encontrada_em, rowid",
            (session["usuario_id"],),
        ).fetchall()
    return jsonify({"pistas": [linha["pista_id"] for linha in linhas]})


@app.post("/api/pistas/<pista_id>")
@exigir_login
def api_registrar_pista(pista_id):
    if pista_id not in {p["id"] for p in carregar_dados("pistas")}:
        return jsonify({"erro": "Pista desconhecida."}), 404
    with banco.conectar() as db:
        cursor = db.execute(
            "INSERT OR IGNORE INTO pistas_encontradas (usuario_id, pista_id) VALUES (?, ?)",
            (session["usuario_id"], pista_id),
        )
        nova = cursor.rowcount == 1
    return jsonify({"nova": nova})


# ---------- API: finais ----------
@app.get("/api/finais")
@exigir_login
def api_finais():
    with banco.conectar() as db:
        linhas = db.execute(
            "SELECT final_id FROM finais_alcancados WHERE usuario_id = ? ORDER BY final_id", (session["usuario_id"],)
        ).fetchall()
    return jsonify({"finais": [linha["final_id"] for linha in linhas]})


@app.post("/api/finais/<final_id>")
@exigir_login
def api_registrar_final(final_id):
    if final_id not in {f["id"] for f in carregar_dados("finais")}:
        return jsonify({"erro": "Final desconhecido."}), 404
    with banco.conectar() as db:
        cursor = db.execute(
            "INSERT OR IGNORE INTO finais_alcancados (usuario_id, final_id) VALUES (?, ?)",
            (session["usuario_id"], final_id),
        )
        novo = cursor.rowcount == 1
    return jsonify({"novo": novo})


# ---------- API: progresso ----------
@app.get("/api/progresso/<etapa>")
@exigir_login
def api_progresso(etapa):
    if etapa not in ETAPAS:
        return jsonify({"erro": "Etapa desconhecida."}), 404
    with banco.conectar() as db:
        linha = db.execute(
            "SELECT estado, concluida FROM progresso WHERE usuario_id = ? AND etapa = ?",
            (session["usuario_id"], etapa),
        ).fetchone()
    if not linha:
        return jsonify({"progresso": None})
    return jsonify({"progresso": {"estado": json.loads(linha["estado"]), "concluida": bool(linha["concluida"])}})


@app.post("/api/progresso/<etapa>")
@exigir_login
def api_salvar_progresso(etapa):
    if etapa not in ETAPAS:
        return jsonify({"erro": "Etapa desconhecida."}), 404

    dados = request.get_json(silent=True) or {}
    estado = dados.get("estado")
    valido = (
        isinstance(estado, dict)
        and isinstance(estado.get("cena"), str) and len(estado["cena"]) <= 60
        and isinstance(estado.get("marcas"), list) and len(estado["marcas"]) <= 100
        and all(isinstance(m, str) and len(m) <= 60 for m in estado["marcas"])
        and (estado.get("hora") is None or isinstance(estado["hora"], int))
    )
    if not valido:
        return jsonify({"erro": "Progresso inválido."}), 400

    with banco.conectar() as db:
        db.execute(
            """
            INSERT INTO progresso (usuario_id, etapa, estado, concluida)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(usuario_id, etapa) DO UPDATE SET
                estado = excluded.estado,
                concluida = MAX(progresso.concluida, excluded.concluida),
                atualizado_em = CURRENT_TIMESTAMP
            """,
            (session["usuario_id"], etapa, json.dumps(estado, ensure_ascii=False), 1 if dados.get("concluida") is True else 0),
        )
    return jsonify({"ok": True})


if __name__ == "__main__":
    # No Replit (variável REPL_ID) o servidor precisa aceitar conexões de fora e não deve abrir o depurador.
    no_replit = bool(os.environ.get("REPL_ID"))
    app.run(
        host="0.0.0.0" if no_replit else "127.0.0.1",
        port=int(os.environ.get("PORT", "5000")),
        debug=not no_replit,
    )
