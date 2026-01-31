const timestamp = new Date().toLocaleString("pt-BR");

console.info(`Kalunga Comunicações: site carregado em ${timestamp}.`);

const pesquisaTarget = document.querySelector("[data-pesquisa-id],[data-pesquisa-slug]");
if (pesquisaTarget) {
  import("/assets/js/pesquisa.js")
    .then((mod) => mod.loadPesquisaPublic())
    .catch((err) => console.error("Falha ao carregar pesquisa.", err));
}
