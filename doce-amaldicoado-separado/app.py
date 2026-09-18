from pathlib import Path
import os
import re
import sqlite3
from functools import wraps

from flask import Flask, jsonify, request, session, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "doce_amaldicoado.db"
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
app.config.update(
    SECRET_KEY=os.environ.get("SECRET_KEY", "troque-esta-chave-em-producao"),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.environ.get("COOKIE_SECURE", "0") == "1",
)


def conectar():
    conexao = sqlite3.connect(DB_PATH)
    conexao.row_factory = sqlite3.Row
    return conexao


def inicializar_banco():
    with conectar() as db:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                senha_hash TEXT NOT NULL,
                criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        db.commit()


def usuario_atual():
    user_id = session.get("usuario_id")
    if not user_id:
        return None
    with conectar() as db:
        return db.execute(
            "SELECT id, nome, email FROM usuarios WHERE id = ?", (user_id,)
        ).fetchone()


def usuario_json(usuario):
    return {"id": usuario["id"], "nome": usuario["nome"], "email": usuario["email"]}


def exigir_login(funcao):
    @wraps(funcao)
    def protegida(*args, **kwargs):
        if usuario_atual() is None:
            return jsonify({"erro": "É necessário entrar na conta."}), 401
        return funcao(*args, **kwargs)

    return protegida


@app.get("/api/sessao")
def sessao_atual():
    usuario = usuario_atual()
    return jsonify({"usuario": usuario_json(usuario) if usuario else None})


@app.post("/api/cadastro")
def cadastrar():
    dados = request.get_json(silent=True) or {}
    nome = str(dados.get("nome", "")).strip()
    email = str(dados.get("email", "")).strip().lower()
    senha = str(dados.get("senha", ""))

    if not nome:
        return jsonify({"erro": "Escreva um nome."}), 400
    if len(nome) > 100:
        return jsonify({"erro": "O nome deve ter no máximo 100 caracteres."}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"erro": "Esse e-mail não parece válido."}), 400
    if len(senha) < 6:
        return jsonify({"erro": "A senha precisa de pelo menos 6 caracteres."}), 400

    try:
        with conectar() as db:
            cursor = db.execute(
                "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
                (nome, email, generate_password_hash(senha)),
            )
            db.commit()
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Já existe um cadastro com esse e-mail."}), 409

    session.clear()
    session["usuario_id"] = user_id
    with conectar() as db:
        usuario = db.execute(
            "SELECT id, nome, email FROM usuarios WHERE id = ?", (user_id,)
        ).fetchone()
    return jsonify({"usuario": usuario_json(usuario)}), 201


@app.post("/api/login")
def login():
    dados = request.get_json(silent=True) or {}
    email = str(dados.get("email", "")).strip().lower()
    senha = str(dados.get("senha", ""))

    with conectar() as db:
        usuario = db.execute(
            "SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?", (email,)
        ).fetchone()

    if not usuario or not check_password_hash(usuario["senha_hash"], senha):
        return jsonify({"erro": "E-mail ou senha não conferem."}), 401

    session.clear()
    session["usuario_id"] = usuario["id"]
    return jsonify({"usuario": usuario_json(usuario)})


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/")
def inicio():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:arquivo>")
def arquivos(arquivo):
    return send_from_directory(BASE_DIR, arquivo)


if __name__ == "__main__":
    inicializar_banco()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=True)
else:
    inicializar_banco()
