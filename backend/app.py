import sqlite3
import json
from flask import Flask, request, jsonify, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, static_folder="site", static_url_path="")
app.secret_key = "chave-secreta-doce-amaldicoado-trocar-em-producao"

DATABASE = "banco.db"


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha_hash TEXT NOT NULL,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS progressos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER UNIQUE NOT NULL,
                dados_jogo TEXT NOT NULL,
                atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
            )
        """
        )
        conn.commit()


# Inicializa as tabelas no banco de dados ao subir a aplicação
init_db()


# Serve o Frontend (index.html, style.css, script.js)
@app.route("/")
def index():
    return send_from_directory("site", "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory("site", filename)


# Rotas da API Backend
@app.route("/api/cadastro", methods=["POST"])
def cadastro():
    data = request.get_json() or {}
    nome = data.get("nome", "").strip()
    email = data.get("email", "").strip().lower()
    senha = data.get("senha", "")

    if not nome or not email or not senha:
        return jsonify({"erro": "Preencha todos os campos."}), 400

    senha_hash = generate_password_hash(senha)

    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
                (nome, email, senha_hash),
            )
            conn.commit()
            usuario_id = cursor.lastrowid

        session["usuario_id"] = usuario_id
        return jsonify({"usuario": {"id": usuario_id, "nome": nome, "email": email}}), 201
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Já existe um usuário com esse e-mail."}), 400


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    senha = data.get("senha", "")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
        usuario = cursor.fetchone()

    if not usuario or not check_password_hash(usuario["senha_hash"], senha):
        return jsonify({"erro": "E-mail ou senha incorretos."}), 401

    session["usuario_id"] = usuario["id"]
    return jsonify({
        "usuario": {
            "id": usuario["id"],
            "nome": usuario["nome"],
            "email": usuario["email"],
        }
    })


@app.route("/api/usuario", methods=["GET"])
def usuario_atual():
    usuario_id = session.get("usuario_id")
    if not usuario_id:
        return jsonify({"usuario": None}), 200

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome, email FROM usuarios WHERE id = ?", (usuario_id,))
        usuario = cursor.fetchone()

    if not usuario:
        return jsonify({"usuario": None}), 200

    return jsonify({"usuario": dict(usuario)})


@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("usuario_id", None)
    return jsonify({"mensagem": "Sessão encerrada com sucesso."})


@app.route("/api/progresso", methods=["GET", "PUT", "POST"])
def progresso():
    usuario_id = session.get("usuario_id")
    if not usuario_id:
        return jsonify({"erro": "Não autorizado. Faça login."}), 401

    if request.method == "GET":
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT dados_jogo FROM progressos WHERE usuario_id = ?",
                (usuario_id,),
            )
            reg = cursor.fetchone()

        if reg:
            return jsonify({"dados_jogo": json.loads(reg["dados_jogo"])})
        return jsonify({"dados_jogo": None})

    # Tratamento para salvamento do jogo (PUT ou POST)
    data = request.get_json() or {}
    dados_jogo = data.get("dados_jogo")

    if not dados_jogo:
        return jsonify({"erro": "Dados inválidos."}), 400

    dados_json = json.dumps(dados_jogo)

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO progressos (usuario_id, dados_jogo, atualizado_em)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(usuario_id) DO UPDATE SET
                dados_jogo = excluded.dados_jogo,
                atualizado_em = CURRENT_TIMESTAMP
        """,
            (usuario_id, dados_json),
        )
        conn.commit()

    return jsonify({"mensagem": "Progresso salvo com sucesso."})


if __name__ == "__main__":
    app.run(debug=True, port=5000)