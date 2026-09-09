const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const header = document.getElementById('main-header');
const imgResults = {
    maquiagem: ["resultados/maquiagem/maquiagem1.jpg","resultados/maquiagem/maquiagem2.jpg","resultados/maquiagem/maquiagem3.jpg"],
    micropigmentacao: ["resultados/micropigmentacao/micropigmentacao1.png","resultados/micropigmentacao/micropigmentacao2.png","resultados/micropigmentacao/micropigmentacao3.png"],
    designSobrancelha: ["resultados/designSobrancelha/designSobrancelha1","resultados/designSobrancelha/designSobrancelha2","resultados/designSobrancelha/designSobrancelha3"],
    limpezaPele: ["resultados/limpezaPele/limpezaPele1","resultados/limpezaPele/limpezaPele2","resultados/limpezaPele/limpezaPele3"]
}
const butResults = document.querySelectorAll("button");
const carResults = document.querySelector(".gallery-carousel");
const glrResults = document.querySelector(".gallery-track");
const quantidade = Math.ceil(carResults.clientWidth / 660) + 1;

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

for (let i = 0; i < quantidade * 2; i++) {
    imgResults.maquiagem.forEach(caminho => {

        const div = document.createElement("div");
        const img = document.createElement("img");

        div.classList.add("gallery-item");

        img.src = caminho;

        div.appendChild(img);
        glrResults.appendChild(div);
    })
}
butResults.forEach(botao =>{
    botao.addEventListener("click", () =>{
        const opcao = botao.dataset.opcao;
        const conjunto = imgResults[opcao];
        const imagens = glrResults.querySelectorAll("img");
        
        imagens.forEach((imagem, indice) =>{
            imagem.src = conjunto[indice % conjunto.length];
        })
    })
})

glrResults.addEventListener("click", (evento) => {

    if (evento.target.tagName === "IMG") {
        glrResults.classList.toggle("paused");

        const itemResults = glrResults.querySelectorAll(".gallery-item img");

        itemResults.forEach(item => {

            item.addEventListener("mousemove", (evento) => {

                const rect = item.getBoundingClientRect();

                const x = evento.clientX - rect.left;

                const porcentagem = x / rect.width;

                const posicao = porcentagem * 2 - 1;

                const movimentoMax = 20;

                const movimento = posicao * movimentoMax;

                item.style.transform = `translateX(${movimento}px)`;

            });

        });
    }

});

