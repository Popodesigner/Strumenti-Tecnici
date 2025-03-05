document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-dimensionamento');
    const tipoSistemaSelect = document.getElementById('tipo-sistema');
    const tensioneInput = document.getElementById('tensione');
    
    // Correnti nominali standard per interruttori magnetotermici
    const correntiNominali = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400, 630, 800, 1000, 1250, 1600];
    
    // Poteri di interruzione standard (kA)
    const poteriInterruzione = [4.5, 6, 10, 15, 25, 36, 50, 70, 100];
    
    // Correnti di intervento differenziale standard (mA)
    const correntiDifferenziali = [30, 100, 300, 500, 1000];
    
    // Sezioni standard dei cavi (mm²)
    const sezioniCavi = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
    
    // Portate dei cavi in funzione della sezione (A)
    const portateRame = {
        '1.5': 17,
        '2.5': 23,
        '4': 31,
        '6': 40,
        '10': 54,
        '16': 73,
        '25': 95,
        '35': 117,
        '50': 141,
        '70': 179,
        '95': 216,
        '120': 249,
        '150': 285,
        '185': 324,
        '240': 380
    };
    
    // Aggiorna il valore di default della tensione in base al tipo di sistema
    tipoSistemaSelect.addEventListener('change', () => {
        const tipoSistema = tipoSistemaSelect.value;
        
        if (tipoSistema === 'monofase') {
            tensioneInput.value = 230;
        } else { // trifase
            tensioneInput.value = 400;
        }
    });
    
    // Inizializza la visualizzazione
    tipoSistemaSelect.dispatchEvent(new Event('change'));
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const tipoSistema = tipoSistemaSelect.value;
        const tipoCarico = document.getElementById('tipo-carico').value;
        const potenza = parseFloat(document.getElementById('potenza').value);
        const tensione = parseFloat(document.getElementById('tensione').value);
        const fattorePotenza = parseFloat(document.getElementById('fattore-potenza').value);
        const fattoreUtilizzo = parseFloat(document.getElementById('fattore-utilizzo').value);
        const fattoreContemporaneita = parseFloat(document.getElementById('fattore-contemporaneita').value);
        const tipoAmbiente = document.getElementById('tipo-ambiente').value;
        const selettivita = document.getElementById('selettivita').value;
        
        // Calcola la corrente di impiego
        let correnteImpiego;
        
        if (tipoSistema === 'monofase') {
            correnteImpiego = (potenza * 1000) / (tensione * fattorePotenza);
        } else { // trifase
            correnteImpiego = (potenza * 1000) / (Math.sqrt(3) * tensione * fattorePotenza);
        }
        
        // Calcola la corrente di progetto (considerando fattori di utilizzo e contemporaneità)
        const correnteProgetto = correnteImpiego * fattoreUtilizzo * fattoreContemporaneita;
        
        // Determina la corrente nominale dell'interruttore magnetotermico
        let correnteNominale = correntiNominali[0];
        
        for (const corrente of correntiNominali) {
            if (corrente >= correnteProgetto) {
                correnteNominale = corrente;
                break;
            }
        }
        
        // Determina la curva di intervento in base al tipo di carico
        let curvaIntervento;
        
        if (tipoCarico === 'resistivo') {
            curvaIntervento = 'B';
        } else if (tipoCarico === 'induttivo') {
            curvaIntervento = 'C';
        } else if (tipoCarico === 'capacitivo' || tipoCarico === 'misto') {
            curvaIntervento = 'D';
        }
        
        // Determina il potere di interruzione minimo
        // In un'applicazione reale, questo dipenderebbe dalla corrente di cortocircuito
        // Per semplicità, usiamo un valore basato sulla corrente nominale
        let potereInterruzione;
        
        if (correnteNominale <= 32) {
            potereInterruzione = 6;
        } else if (correnteNominale <= 63) {
            potereInterruzione = 10;
        } else if (correnteNominale <= 125) {
            potereInterruzione = 15;
        } else {
            potereInterruzione = 25;
        }
        
        // Determina il differenziale consigliato in base al tipo di ambiente
        let correnteDifferenziale;
        let tipoDifferenziale;
        
        if (tipoAmbiente === 'normale') {
            correnteDifferenziale = 300;
            tipoDifferenziale = 'AC';
        } else if (tipoAmbiente === 'umido') {
            correnteDifferenziale = 30;
            tipoDifferenziale = 'A';
        } else if (tipoAmbiente === 'bagnato') {
            correnteDifferenziale = 30;
            tipoDifferenziale = 'A';
        } else if (tipoAmbiente === 'corrosivo') {
            correnteDifferenziale = 30;
            tipoDifferenziale = 'A';
        } else { // esplosivo
            correnteDifferenziale = 30;
            tipoDifferenziale = 'B';
        }
        
        // Determina la sezione minima del cavo
        let sezioneMinima = sezioniCavi[0];
        
        for (const sezione of sezioniCavi) {
            if (portateRame[sezione.toString()] >= correnteNominale) {
                sezioneMinima = sezione;
                break;
            }
        }
        
        // Mostra i risultati
        document.getElementById('corrente-impiego').textContent = `${correnteImpiego.toFixed(2)} A`;
        document.getElementById('corrente-progetto').textContent = `${correnteProgetto.toFixed(2)} A`;
        document.getElementById('interruttore-termico').textContent = `${correnteNominale} A`;
        document.getElementById('curva-intervento').textContent = curvaIntervento;
        document.getElementById('potere-interruzione').textContent = `${potereInterruzione} kA`;
        document.getElementById('differenziale').textContent = `${correnteDifferenziale} mA, tipo ${tipoDifferenziale}`;
        document.getElementById('sezione-minima').textContent = `${sezioneMinima} mm²`;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 