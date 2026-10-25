// Lê os arquivos da história (pasta /data) através do servidor.
import { api } from "./api.js";

export const carregarDados = (nome) => api(`/api/dados/${nome}`);
export const urlRetrato = (id) => `/static/img/retratos/${id}.svg`;
