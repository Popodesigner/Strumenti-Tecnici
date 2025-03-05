document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-serie-termostatica');
    const tipoSerieSelect = document.getElementById('tipo-serie');
    const precisioneSelect = document.getElementById('precisione');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const tipoSerie = tipoSerieSelect.value;
        const precisione = parseInt(precisioneSelect.value);
        const valoreIniziale = parseFloat(document.getElementById('valore-iniziale').value);
        const valoreFinale = parseFloat(document.getElementById('valore-finale').value);
        const unitaMisura = document.getElementById('unita-misura').value;
        const arrotondamento = parseInt(document.getElementById('arrotondamento').value);
        
        // Calcola il rapporto tra valori successivi
        let rapporto;
        let numeroValoriPerDecade;
        
        if (tipoSerie === 'renard') {
            rapporto = Math.pow(10, 1 / precisione);
            numeroValoriPerDecade = precisione;
        } else { // serie E
            // La serie E ha un numero di valori per decade diverso dalla serie di Renard
            if (precisione === 5) {
                numeroValoriPerDecade = 6; // E6
            } else if (precisione === 10) {
                numeroValoriPerDecade = 12; // E12
            } else if (precisione === 20) {
                numeroValoriPerDecade = 24; // E24
            } else if (precisione === 40) {
                numeroValoriPerDecade = 48; // E48
            } else { // precisione === 80
                numeroValoriPerDecade = 96; // E96
            }
            
            rapporto = Math.pow(10, 1 / numeroValoriPerDecade);
        }
        
        // Calcola i valori della serie
        const valori = [];
        let valore = valoreIniziale;
        
        while (valore <= valoreFinale) {
            valori.push(valore);
            valore *= rapporto;
        }
        
        // Arrotonda i valori
        const valoriArrotondati = valori.map(v => parseFloat(v.toFixed(arrotondamento)));
        
        // Mostra i risultati
        let serieTipo;
        if (tipoSerie === 'renard') {
            serieTipo = `R${precisione}`;
        } else { // serie E
            serieTipo = `E${numeroValoriPerDecade}`;
        }
        
        document.getElementById('serie-tipo').textContent = serieTipo;
        document.getElementById('numero-valori').textContent = valoriArrotondati.length;
        document.getElementById('rapporto-valori').textContent = rapporto.toFixed(4);
        
        // Crea una tabella per i valori
        const valoriContainer = document.getElementById('valori-serie');
        valoriContainer.innerHTML = '';
        
        const table = document.createElement('table');
        table.className = 'valori-tabella';
        
        // Crea l'intestazione della tabella
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const thIndice = document.createElement('th');
        thIndice.textContent = 'Indice';
        headerRow.appendChild(thIndice);
        
        const thValore = document.createElement('th');
        thValore.textContent = `Valore (${unitaMisura})`;
        headerRow.appendChild(thValore);
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Crea il corpo della tabella
        const tbody = document.createElement('tbody');
        
        valoriArrotondati.forEach((valore, indice) => {
            const row = document.createElement('tr');
            
            const tdIndice = document.createElement('td');
            tdIndice.textContent = indice + 1;
            row.appendChild(tdIndice);
            
            const tdValore = document.createElement('td');
            tdValore.textContent = valore;
            row.appendChild(tdValore);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        valoriContainer.appendChild(table);
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 