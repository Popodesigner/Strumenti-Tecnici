class StrumentiIdraulici {
  constructor() {
    // Dati hardcoded per evitare problemi di caricamento
    this.strumenti = [
      {
        "cod": "STR0001",
        "nome": "Dimensionamento",
        "categoria": "Tabulazioni",
        "tipo": "calcola_diametri",
        "icona": "e_i_STR0001_1.png",
        "script": "STR0001.html",
        "calcoli": "Calcoli",
        "categoria_principale": "idraulici"
      },
      {
        "cod": "STR0002",
        "nome": "Portata",
        "categoria": "Pompe",
        "tipo": "calcola_portata",
        "icona": "prevalenza_i_STR0002_1.png",
        "script": "STR0002.html",
        "calcoli": "Calcoli",
        "categoria_principale": "idraulici"
      },
      {
        "cod": "STR0003",
        "nome": "Potenza",
        "categoria": "Termica",
        "tipo": "calcola_fabbisogno",
        "icona": "energetico_i_STR0003_1.png",
        "script": "STR0003.html",
        "calcoli": "Calcoli",
        "categoria_principale": "idraulici"
      }
    ];
    
    // Aggiungi strumenti direttamente all'HTML per debug
    this.renderStrumentiDiretto();
  }

  renderStrumentiDiretto() {
    const container = document.getElementById('strumenti-container');
    
    if (!container) {
      console.error('Container non trovato!');
      return;
    }
    
    // Svuota il container
    container.innerHTML = '';
    
    // Aggiungi HTML direttamente
    let html = '';
    
    this.strumenti.forEach(strumento => {
      html += `
        <div class="strumento-card" data-cod="${strumento.cod}">
          <h3>${strumento.nome}</h3>
          <p>${strumento.categoria}</p>
          <a href="strumenti/${strumento.script}" class="btn-calcola">Apri</a>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    console.log('Strumenti renderizzati:', this.strumenti.length);
  }
}

// Inizializza subito e anche al caricamento del DOM
const app = new StrumentiIdraulici();

document.addEventListener('DOMContentLoaded', () => {
  window.appStrumenti = app;
  // Renderizza di nuovo per sicurezza
  app.renderStrumentiDiretto();
}); 