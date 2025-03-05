document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-perdite-carico');
    const tipoCalcoloSelect = document.getElementById('tipo-calcolo');
    const sezioneTubazione = document.getElementById('sezione-tubazione');
    const sezioneComponenti = document.getElementById('sezione-componenti');
    const materialeSelect = document.getElementById('materiale');
    const rugositaInput = document.getElementById('rugosita');
    const resultItemLunghezzaEq = document.getElementById('result-item-lunghezza-eq');
    
    // Valori di rugosità per diversi materiali (mm)
    const rugositaMateriali = {
        'acciaio': 0.045,
        'rame': 0.0015,
        'pvc': 0.007,
        'pex': 0.007,
        'multistrato': 0.007
    };
    
    // Coefficienti di perdita localizzata (K) per vari componenti
    const coefficientiK = {
        'curve90': 0.75,
        'curve45': 0.4,
        'valvole': 0.3,
        'valvole-ritegno': 2.5,
        'tee-passaggio': 0.5,
        'tee-derivazione': 1.5
    };
    
    // Mostra/nascondi sezioni in base al tipo di calcolo
    tipoCalcoloSelect.addEventListener('change', () => {
        const tipoCalcolo = tipoCalcoloSelect.value;
        
        if (tipoCalcolo === 'tubazione') {
            sezioneTubazione.classList.remove('hidden');
            sezioneComponenti.classList.add('hidden');
            resultItemLunghezzaEq.classList.add('hidden');
        } else {
            sezioneTubazione.classList.add('hidden');
            sezioneComponenti.classList.remove('hidden');
            resultItemLunghezzaEq.classList.remove('hidden');
        }
    });
    
    // Aggiorna il valore di rugosità quando cambia il materiale
    materialeSelect.addEventListener('change', () => {
        const materiale = materialeSelect.value;
        rugositaInput.value = rugositaMateriali[materiale];
    });
    
    // Imposta il valore iniziale di rugosità
    rugositaInput.value = rugositaMateriali[materialeSelect.value];
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const tipoCalcolo = tipoCalcoloSelect.value;
        
        if (tipoCalcolo === 'tubazione') {
            // Calcolo perdite distribuite in tubazione
            const lunghezza = parseFloat(document.getElementById('lunghezza').value);
            const diametroMm = parseFloat(document.getElementById('diametro').value);
            const portataLs = parseFloat(document.getElementById('portata').value);
            const rugosita = parseFloat(document.getElementById('rugosita').value);
            
            // Converti unità di misura
            const diametroM = diametroMm / 1000; // mm -> m
            const portataM3s = portataLs / 1000; // l/s -> m³/s
            const rugositaRelativa = rugosita / 1000 / diametroM; // mm -> m
            
            // Calcola la velocità del fluido
            const area = Math.PI * Math.pow(diametroM / 2, 2); // m²
            const velocita = portataM3s / area; // m/s
            
            // Calcola il numero di Reynolds
            // Re = ρ * v * D / μ
            // Assumiamo acqua a 20°C: ρ = 998.2 kg/m³, μ = 1.002e-3 Pa·s
            const reynolds = (998.2 * velocita * diametroM) / (1.002e-3);
            
            // Calcola il fattore di attrito (formula di Swamee-Jain)
            let fattoreAttrito;
            if (reynolds < 2300) {
                // Flusso laminare
                fattoreAttrito = 64 / reynolds;
            } else {
                // Flusso turbolento
                fattoreAttrito = 0.25 / Math.pow(Math.log10(rugositaRelativa / 3.7 + 5.74 / Math.pow(reynolds, 0.9)), 2);
            }
            
            // Calcola la perdita di carico unitaria (formula di Darcy-Weisbach)
            // hf/L = f * (v²/2g) * (1/D)
            const perditaUnitaria = fattoreAttrito * (Math.pow(velocita, 2) / (2 * 9.81)) * (1 / diametroM);
            
            // Calcola la perdita di carico totale
            const perditaTotale = perditaUnitaria * lunghezza;
            
            // Mostra i risultati
            document.getElementById('velocita-fluido').textContent = `${velocita.toFixed(2)} m/s`;
            document.getElementById('numero-reynolds').textContent = `${reynolds.toFixed(0)}`;
            document.getElementById('perdita-unitaria').textContent = `${(perditaUnitaria * 1000).toFixed(2)} mm/m`;
            document.getElementById('perdita-totale').textContent = `${(perditaTotale * 1000).toFixed(2)} mm (${perditaTotale.toFixed(4)} m)`;
            
        } else {
            // Calcolo perdite concentrate nei componenti
            const diametroMm = parseFloat(document.getElementById('diametro-comp').value);
            const portataLs = parseFloat(document.getElementById('portata-comp').value);
            
            // Converti unità di misura
            const diametroM = diametroMm / 1000; // mm -> m
            const portataM3s = portataLs / 1000; // l/s -> m³/s
            
            // Calcola la velocità del fluido
            const area = Math.PI * Math.pow(diametroM / 2, 2); // m²
            const velocita = portataM3s / area; // m/s
            
            // Calcola il numero di Reynolds
            const reynolds = (998.2 * velocita * diametroM) / (1.002e-3);
            
            // Calcola la perdita di carico totale per i componenti
            let perditaTotale = 0;
            let lunghezzaEquivalente = 0;
            
            // Itera su tutti i componenti
            const componenti = ['curve90', 'curve45', 'valvole', 'valvole-ritegno', 'tee-passaggio', 'tee-derivazione'];
            
            for (const componente of componenti) {
                const quantita = parseInt(document.getElementById(componente).value);
                if (quantita > 0) {
                    const coeffK = coefficientiK[componente];
                    
                    // Perdita di carico per il componente: h = K * (v²/2g)
                    const perditaComponente = coeffK * Math.pow(velocita, 2) / (2 * 9.81) * quantita;
                    perditaTotale += perditaComponente;
                    
                    // Lunghezza equivalente: Leq = K * D / f
                    // Assumiamo un fattore di attrito approssimato di 0.02 per semplificare
                    const fattoreAttritoApprox = 0.02;
                    const lunghezzaEqComponente = coeffK * diametroM / fattoreAttritoApprox * quantita;
                    lunghezzaEquivalente += lunghezzaEqComponente;
                }
            }
            
            // Mostra i risultati
            document.getElementById('velocita-fluido').textContent = `${velocita.toFixed(2)} m/s`;
            document.getElementById('numero-reynolds').textContent = `${reynolds.toFixed(0)}`;
            document.getElementById('perdita-unitaria').textContent = `N/A`;
            document.getElementById('perdita-totale').textContent = `${(perditaTotale * 1000).toFixed(2)} mm (${perditaTotale.toFixed(4)} m)`;
            document.getElementById('lunghezza-equivalente').textContent = `${lunghezzaEquivalente.toFixed(2)} m`;
        }
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
    
    // Inizializza la visualizzazione corretta
    tipoCalcoloSelect.dispatchEvent(new Event('change'));
}); 