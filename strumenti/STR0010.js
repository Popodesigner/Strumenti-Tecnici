document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-potenza-elettrica');
    const tipoCalcoloSelect = document.getElementById('tipo-calcolo');
    const tipoSistemaSelect = document.getElementById('tipo-sistema');
    const inputPotenza = document.getElementById('input-potenza');
    const inputTensione = document.getElementById('input-tensione');
    const inputCorrente = document.getElementById('input-corrente');
    const inputFattorePotenza = document.getElementById('input-fattore-potenza');
    const inputRendimento = document.getElementById('input-rendimento');
    const tensioneInput = document.getElementById('tensione');
    
    // Mostra/nascondi i campi in base al tipo di calcolo
    tipoCalcoloSelect.addEventListener('change', () => {
        const tipoCalcolo = tipoCalcoloSelect.value;
        
        // Mostra tutti i campi
        inputPotenza.style.display = 'block';
        inputTensione.style.display = 'block';
        inputCorrente.style.display = 'block';
        
        // Nascondi il campo che verrà calcolato
        if (tipoCalcolo === 'potenza') {
            inputPotenza.style.display = 'none';
        } else if (tipoCalcolo === 'corrente') {
            inputCorrente.style.display = 'none';
        } else if (tipoCalcolo === 'tensione') {
            inputTensione.style.display = 'none';
        }
    });
    
    // Mostra/nascondi il fattore di potenza in base al tipo di sistema
    tipoSistemaSelect.addEventListener('change', () => {
        const tipoSistema = tipoSistemaSelect.value;
        
        if (tipoSistema === 'continua') {
            inputFattorePotenza.style.display = 'none';
        } else {
            inputFattorePotenza.style.display = 'block';
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
    tipoCalcoloSelect.dispatchEvent(new Event('change'));
    tipoSistemaSelect.dispatchEvent(new Event('change'));
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const tipoCalcolo = tipoCalcoloSelect.value;
        const tipoSistema = tipoSistemaSelect.value;
        
        let potenza = parseFloat(document.getElementById('potenza').value);
        let tensione = parseFloat(document.getElementById('tensione').value);
        let corrente = parseFloat(document.getElementById('corrente').value);
        let fattorePotenza = parseFloat(document.getElementById('fattore-potenza').value);
        let rendimento = parseFloat(document.getElementById('rendimento').value) / 100; // Converti in decimale
        
        // Calcola i valori mancanti in base al tipo di calcolo
        if (tipoCalcolo === 'potenza') {
            if (tipoSistema === 'monofase') {
                potenza = tensione * corrente * fattorePotenza / 1000; // kW
            } else if (tipoSistema === 'trifase') {
                potenza = Math.sqrt(3) * tensione * corrente * fattorePotenza / 1000; // kW
            } else { // continua
                potenza = tensione * corrente / 1000; // kW
            }
        } else if (tipoCalcolo === 'corrente') {
            if (tipoSistema === 'monofase') {
                corrente = (potenza * 1000) / (tensione * fattorePotenza); // A
            } else if (tipoSistema === 'trifase') {
                corrente = (potenza * 1000) / (Math.sqrt(3) * tensione * fattorePotenza); // A
            } else { // continua
                corrente = (potenza * 1000) / tensione; // A
            }
        } else if (tipoCalcolo === 'tensione') {
            if (tipoSistema === 'monofase') {
                tensione = (potenza * 1000) / (corrente * fattorePotenza); // V
            } else if (tipoSistema === 'trifase') {
                tensione = (potenza * 1000) / (Math.sqrt(3) * corrente * fattorePotenza); // V
            } else { // continua
                tensione = (potenza * 1000) / corrente; // V
            }
        }
        
        // Calcola la potenza apparente (S = P / cos φ)
        let potenzaApparente;
        if (tipoSistema === 'continua') {
            potenzaApparente = potenza; // In DC, P = S
        } else {
            potenzaApparente = potenza / fattorePotenza;
        }
        
        // Calcola la potenza reattiva (Q = S * sin φ)
        let potenzaReattiva;
        if (tipoSistema === 'continua') {
            potenzaReattiva = 0; // In DC, Q = 0
        } else {
            const angolo = Math.acos(fattorePotenza);
            potenzaReattiva = potenzaApparente * Math.sin(angolo);
        }
        
        // Calcola la potenza meccanica (Pm = P * η)
        const potenzaMeccanica = potenza * rendimento;
        
        // Mostra/nascondi i risultati in base al tipo di calcolo
        document.getElementById('result-potenza').style.display = tipoCalcolo === 'potenza' ? 'flex' : 'none';
        document.getElementById('result-corrente').style.display = tipoCalcolo === 'corrente' ? 'flex' : 'none';
        document.getElementById('result-tensione').style.display = tipoCalcolo === 'tensione' ? 'flex' : 'none';
        
        // Mostra/nascondi i risultati in base al tipo di sistema
        document.getElementById('result-potenza-apparente').style.display = tipoSistema === 'continua' ? 'none' : 'flex';
        document.getElementById('result-potenza-reattiva').style.display = tipoSistema === 'continua' ? 'none' : 'flex';
        
        // Aggiorna i valori dei risultati
        document.getElementById('potenza-risultato').textContent = `${potenza.toFixed(2)} kW`;
        document.getElementById('potenza-apparente').textContent = `${potenzaApparente.toFixed(2)} kVA`;
        document.getElementById('potenza-reattiva').textContent = `${potenzaReattiva.toFixed(2)} kVAR`;
        document.getElementById('corrente-risultato').textContent = `${corrente.toFixed(2)} A`;
        document.getElementById('tensione-risultato').textContent = `${tensione.toFixed(2)} V`;
        document.getElementById('potenza-meccanica').textContent = `${potenzaMeccanica.toFixed(2)} kW`;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 