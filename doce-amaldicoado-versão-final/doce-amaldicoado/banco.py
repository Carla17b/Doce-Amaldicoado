"""Banco de dados (SQLite). Aqui ficam só a conexão e as tabelas."""
import sqlite3
from pathlib import Path

CAMINHO = Path(__file__).resolve().parent / "doce_amaldicoado.db"


def conectar():
    conexao = sqlite3.connect(CAMINHO)
    conexao.row_factory = sqlite3.Row
    return conexao


def inicializar():
    """Cria as tabelas que ainda não existem. Pode ser chamada sempre."""
    with conectar() as db:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                nome       TEXT NOT NULL,
                email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
                senha_hash TEXT NOT NULL,
                criado_em  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS detetives (
                usuario_id   INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
                nome         TEXT NOT NULL,
                codinome     TEXT NOT NULL DEFAULT '',
                retrato      TEXT NOT NULL,
                especialidade TEXT NOT NULL,
                passado      TEXT NOT NULL,
                atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS progresso (
                usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                etapa         TEXT NOT NULL,
                estado        TEXT NOT NULL,
                concluida     INTEGER NOT NULL DEFAULT 0,
                atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (usuario_id, etapa)
            )
            """
        )
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS finais_alcancados (
                usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                final_id      TEXT NOT NULL,
                alcancado_em  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (usuario_id, final_id)
            )
            """
        )
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS pistas_encontradas (
                usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                pista_id      TEXT NOT NULL,
                encontrada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (usuario_id, pista_id)
            )
            """
        )
