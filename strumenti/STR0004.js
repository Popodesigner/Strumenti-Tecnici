document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-vaso-espansione');
    const tipoImpiantoSelect = document.getElementById('tipo-impianto');
    
    // Coefficienti di espansione dell'acqua a diverse temperature
    const coefficientiEspansioneAcqua = {
        10: 0.00027,
        20: 0.00177,
        30: 0.00435,
        40: 0.00782,
        50: 0.01210,
        60: 0.01710,
        70: 0.02270,
        80: 0.02900,
        90: 0.03590,
        100: 0.04340
    };
    
    // Fattori di correzione per il glicole
    const fattoriCorrezioneGlicole = {
        0: 1.00,
        10: 1.05,
        20: 1.10,
        30: 1.15,
        40: 1.20,
        50: 1.25
    };
    
    // Volumi commerciali standard dei vasi di espansione (litri)
    const volumiCommerciali = [2, 5, 8, 12, 18, 24, 35, 50, 80, 100, 150, 200, 250, 300, 500];
    
    // Funzione per interpolare i coefficienti di espansione
    function interpolaCoefficienteEspansione(temperatura) {
        const temperature = Object.keys(coefficientiEspansioneAcqua).map(Number).sort((a, b) => a - b);
        
        // Se la temperatura è esattamente una di quelle nella tabella
        if (temperatura in coefficientiEspansioneAcqua) {
            return coefficientiEspansioneAcqua[temperatura];
        }
        
        // Trova le temperature più vicine per interpolare
        let tempInf = temperature[0];
        let tempSup = temperature[temperature.length - 1];
        
        for (let i = 0; i < temperature.length; i++) {
            if (temperature[i] > temperatura) {
                tempSup = temperature[i];
                tempInf = temperature[i - 1];
                break;
            }
        }
        
        // Interpola linearmente
        const factor = (temperatura - tempInf) / (tempSup - tempInf);
        const coeffInf = coefficientiEspansioneAcqua[tempInf];
        const coeffSup = coefficientiEspansioneAcqua[tempSup];
        
        return coeffInf + factor * (coeffSup - coeffInf);
    }
    
    // Funzione per interpolare i fattori di correzione per il glicole
    function interpolaFattoreGlicole(percentuale) {
        const percentuali = Object.keys(fattoriCorrezioneGlicole).map(Number).sort((a, b) => a - b);
        
        // Se la percentuale è esattamente una di quelle nella tabella
        if (percentuale in fattoriCorrezioneGlicole) {
            return fattoriCorrezioneGlicole[percentuale];
        }
        
        // Trova le percentuali più vicine per interpolare
        let percInf = percentuali[0];
        let percSup = percentuali[percentuali.length - 1];
        
        for (let i = 0; i < percentuali.length; i++) {
            if (percentuali[i] > percentuale) {
                percSup = percentuali[i];
                percInf = percentuali[i - 1];
                break;
            }
        }
        
        // Interpola linearmente
        const factor = (percentuale - percInf) / (percSup - percInf);
        const fattoreInf = fattoriCorrezioneGlicole[percInf];
        const fattoreSup = fattoriCorrezioneGlicole[percSup];
        
        return fattoreInf + factor * (fattoreSup - fattoreInf);
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const tipoImpianto = tipoImpiantoSelect.value;
        const contenutoAcqua = parseFloat(document.getElementById('contenuto-acqua').value);
        const temperaturaMin = parseFloat(document.getElementById('temperatura-min').value);
        const temperaturaMax = parseFloat(document.getElementById('temperatura-max').value);
        const pressioneIniziale = parseFloat(document.getElementById('pressione-iniziale').value);
        const pressioneMassima = parseFloat(document.getElementById('pressione-massima').value);
        const percentualeGlicole = parseFloat(document.getElementById('percentuale-glicole').value);
        
        // Calcola il coefficiente di espansione
        const coeffEspansione = interpolaCoefficienteEspansione(temperaturaMax) - interpolaCoefficienteEspansione(temperaturaMin);
        
        // Applica il fattore di correzione per il glicole
        const fattoreGlicole = interpolaFattoreGlicole(percentualeGlicole);
        const coeffEspansioneCorretto = coeffEspansione * fattoreGlicole;
        
        // Calcola il volume di espansione
        const volumeEspansione = contenutoAcqua * coeffEspansioneCorretto;
        
        // Calcola il fattore di pressione
        // Fp = (Pmax - Pi) / Pmax
        const fattorePressione = (pressioneMassima - pressioneIniziale) / pressioneMassima;
        
        // Calcola il volume del vaso di espansione
        // Vvaso = Ve / Fp
        const volumeVaso = volumeEspansione / fattorePressione;
        
        // Trova il volume commerciale più vicino (ma superiore)
        let volumeCommerciale = volumiCommerciali[0];
        
        for (let i = 0; i < volumiCommerciali.length; i++) {
            if (volumiCommerciali[i] >= volumeVaso) {
                volumeCommerciale = volumiCommerciali[i];
                break;
            }
            
            // Se siamo all'ultimo elemento e ancora non abbiamo trovato un volume adeguato
            if (i === volumiCommerciali.length - 1) {
                volumeCommerciale = volumiCommerciali[i];
            }
        }
        
        // Mostra i risultati
        document.getElementById('coefficiente-espansione').textContent = `${(coeffEspansioneCorretto * 100).toFixed(2)}%`;
        document.getElementById('volume-espansione').textContent = `${volumeEspansione.toFixed(2)} litri`;
        document.getElementById('fattore-pressione').textContent = `${fattorePressione.toFixed(3)}`;
        document.getElementById('volume-vaso').textContent = `${volumeVaso.toFixed(2)} litri`;
        document.getElementById('volume-commerciale').textContent = `${volumeCommerciale} litri`;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 