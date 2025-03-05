document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-caduta-tensione');
    const tipoSistemaSelect = document.getElementById('tipo-sistema');
    const fattorePotenzaInput = document.getElementById('input-fattore-potenza');
    const tensioneInput = document.getElementById('tensione');
    
    // Resistività dei materiali in funzione della temperatura (Ω·mm²/m)
    const resistivita = {
        'rame': {
            '20': 0.0178,
            '70': 0.0225,
            '90': 0.0244
        },
        'alluminio': {
            '20': 0.0290,
            '70': 0.0367,
            '90': 0.0398
        }
    };
    
    // Reattanza specifica per unità di lunghezza (Ω/m) in funzione della sezione
    const reattanzaSpecifica = {
        '1.5': 0.000115,
        '2.5': 0.000110,
        '4': 0.000105,
        '6': 0.000100,
        '10': 0.000095,
        '16': 0.000090,
        '25': 0.000085,
        '35': 0.000083,
        '50': 0.000080,
        '70': 0.000078,
        '95': 0.000075,
        '120': 0.000073,
        '150': 0.000070,
        '185': 0.000068,
        '240': 0.000066
    };
    
    // Mostra/nascondi il fattore di potenza in base al tipo di sistema
    tipoSistemaSelect.addEventListener('change', () => {
        const tipoSistema = tipoSistemaSelect.value;
        
        if (tipoSistema === 'continua') {
            document.getElementById('fattore-potenza').closest('.form-group').style.display = 'none';
        } else {
            document.getElementById('fattore-potenza').closest('.form-group').style.display = 'block';
        }
        
        // Aggiorna il valore di default della tensione
        if (tipoSistema === 'monofase') {
            tensioneInput.value = 230;
        } else if (tipoSistema === 'trifase') {
            tensioneInput.value = 400;
        } else { // continua
            tensioneInput.value = 24;
        }
    });
    
    // Inizializza la visualizzazione
    tipoSistemaSelect.dispatchEvent(new Event('change'));
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const tipoSistema = tipoSistemaSelect.value;
        const potenza = parseFloat(document.getElementById('potenza').value);
        const tensione = parseFloat(document.getElementById('tensione').value);
        const fattorePotenza = parseFloat(document.getElementById('fattore-potenza').value);
        const lunghezza = parseFloat(document.getElementById('lunghezza').value);
        const sezione = parseFloat(document.getElementById('sezione').value);
        const materialeConduttore = document.getElementById('materiale-conduttore').value;
        const temperatura = parseFloat(document.getElementById('temperatura').value);
        
        // Calcola la corrente di impiego
        let correnteImpiego;
        
        if (tipoSistema === 'monofase') {
            correnteImpiego = (potenza * 1000) / (tensione * fattorePotenza);
        } else if (tipoSistema === 'trifase') {
            correnteImpiego = (potenza * 1000) / (Math.sqrt(3) * tensione * fattorePotenza);
        } else { // continua
            correnteImpiego = (potenza * 1000) / tensione;
        }
        
        // Calcola la resistenza del cavo
        // Interpola la resistività in base alla temperatura
        let resistivitaMateriale;
        
        if (temperatura <= 20) {
            resistivitaMateriale = resistivita[materialeConduttore]['20'];
        } else if (temperatura <= 70) {
            const t1 = 20;
            const t2 = 70;
            const r1 = resistivita[materialeConduttore]['20'];
            const r2 = resistivita[materialeConduttore]['70'];
            resistivitaMateriale = r1 + (r2 - r1) * (temperatura - t1) / (t2 - t1);
        } else {
            const t1 = 70;
            const t2 = 90;
            const r1 = resistivita[materialeConduttore]['70'];
            const r2 = resistivita[materialeConduttore]['90'];
            resistivitaMateriale = r1 + (r2 - r1) * (temperatura - t1) / (t2 - t1);
        }
        
        const resistenzaCavo = resistivitaMateriale * lunghezza / sezione; // Ω
        
        // Calcola la reattanza del cavo (solo per AC)
        let reattanzaCavo = 0;
        if (tipoSistema !== 'continua') {
            reattanzaCavo = reattanzaSpecifica[sezione.toString()] * lunghezza; // Ω
        }
        
        // Calcola la caduta di tensione
        let cadutaTensioneAssoluta;
        
        if (tipoSistema === 'monofase') {
            cadutaTensioneAssoluta = 2 * correnteImpiego * (resistenzaCavo * fattorePotenza + reattanzaCavo * Math.sin(Math.acos(fattorePotenza)));
        } else if (tipoSistema === 'trifase') {
            cadutaTensioneAssoluta = Math.sqrt(3) * correnteImpiego * (resistenzaCavo * fattorePotenza + reattanzaCavo * Math.sin(Math.acos(fattorePotenza)));
        } else { // continua
            cadutaTensioneAssoluta = 2 * correnteImpiego * resistenzaCavo;
        }
        
        const cadutaTensionePercentuale = (cadutaTensioneAssoluta / tensione) * 100;
        const tensioneFineLinea = tensione - cadutaTensioneAssoluta;
        
        // Calcola la perdita di potenza
        let perditaPotenza;
        
        if (tipoSistema === 'monofase') {
            perditaPotenza = 2 * Math.pow(correnteImpiego, 2) * resistenzaCavo / 1000; // kW
        } else if (tipoSistema === 'trifase') {
            perditaPotenza = 3 * Math.pow(correnteImpiego, 2) * resistenzaCavo / 1000; // kW
        } else { // continua
            perditaPotenza = 2 * Math.pow(correnteImpiego, 2) * resistenzaCavo / 1000; // kW
        }
        
        // Mostra i risultati
        document.getElementById('corrente-impiego').textContent = `${correnteImpiego.toFixed(2)} A`;
        document.getElementById('resistenza-cavo').textContent = `${resistenzaCavo.toFixed(4)} Ω`;
        document.getElementById('reattanza-cavo').textContent = `${reattanzaCavo.toFixed(4)} Ω`;
        document.getElementById('caduta-tensione-assoluta').textContent = `${cadutaTensioneAssoluta.toFixed(2)} V`;
        document.getElementById('caduta-tensione-percentuale').textContent = `${cadutaTensionePercentuale.toFixed(2)}%`;
        document.getElementById('tensione-fine-linea').textContent = `${tensioneFineLinea.toFixed(2)} V`;
        document.getElementById('perdita-potenza').textContent = `${perditaPotenza.toFixed(3)} kW (${((perditaPotenza / potenza) * 100).toFixed(2)}%)`;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 