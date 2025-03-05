document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-circolatore');
    const tipoImpiantoSelect = document.getElementById('tipo-impianto');
    
    // Proprietà dei fluidi a diverse temperature e percentuali di glicole
    const proprietaFluidi = {
        'acqua': {
            'calore_specifico': 4.186, // kJ/(kg·K)
            'densita': 998.2 // kg/m³
        },
        'glicole': {
            10: {
                'calore_specifico': 3.97, // kJ/(kg·K)
                'densita': 1015 // kg/m³
            },
            20: {
                'calore_specifico': 3.78, // kJ/(kg·K)
                'densita': 1029 // kg/m³
            },
            30: {
                'calore_specifico': 3.60, // kJ/(kg·K)
                'densita': 1043 // kg/m³
            },
            40: {
                'calore_specifico': 3.42, // kJ/(kg·K)
                'densita': 1057 // kg/m³
            },
            50: {
                'calore_specifico': 3.25, // kJ/(kg·K)
                'densita': 1071 // kg/m³
            }
        }
    };
    
    // Diametri commerciali delle tubazioni (mm)
    const diametriCommerciali = [10, 15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200];
    
    // Funzione per interpolare le proprietà del fluido in base alla percentuale di glicole
    function interpolaProprietaFluido(percentualeGlicole) {
        if (percentualeGlicole === 0) {
            return proprietaFluidi.acqua;
        }
        
        const percentuali = Object.keys(proprietaFluidi.glicole).map(Number).sort((a, b) => a - b);
        
        // Se la percentuale è esattamente una di quelle nella tabella
        if (percentualeGlicole in proprietaFluidi.glicole) {
            return proprietaFluidi.glicole[percentualeGlicole];
        }
        
        // Trova le percentuali più vicine per interpolare
        let percInf = percentuali[0];
        let percSup = percentuali[percentuali.length - 1];
        
        for (let i = 0; i < percentuali.length; i++) {
            if (percentuali[i] > percentualeGlicole) {
                percSup = percentuali[i];
                percInf = percentuali[i - 1];
                break;
            }
        }
        
        // Interpola linearmente
        const factor = (percentualeGlicole - percInf) / (percSup - percInf);
        const propInf = proprietaFluidi.glicole[percInf];
        const propSup = proprietaFluidi.glicole[percSup];
        
        return {
            'calore_specifico': propInf.calore_specifico + factor * (propSup.calore_specifico - propInf.calore_specifico),
            'densita': propInf.densita + factor * (propSup.densita - propInf.densita)
        };
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const tipoImpianto = tipoImpiantoSelect.value;
        const potenzaTermica = parseFloat(document.getElementById('potenza-termica').value);
        const deltaT = parseFloat(document.getElementById('delta-t').value);
        const perditeCarico = parseFloat(document.getElementById('perdite-carico').value);
        const lunghezzaCircuito = parseFloat(document.getElementById('lunghezza-circuito').value);
        const percentualeGlicole = parseFloat(document.getElementById('percentuale-glicole').value);
        
        // Ottieni le proprietà del fluido
        const proprietaFluido = interpolaProprietaFluido(percentualeGlicole);
        const caloreSpecifico = proprietaFluido.calore_specifico;
        const densita = proprietaFluido.densita;
        
        // Calcola la portata massica (kg/s)
        const portataMassica = potenzaTermica / (caloreSpecifico * deltaT);
        
        // Calcola la portata volumetrica (m³/s)
        const portataVolumetrica = portataMassica / densita;
        
        // Converti in unità più pratiche
        const portataM3h = portataVolumetrica * 3600;
        const portataLs = portataVolumetrica * 1000;
        
        // Calcola la prevalenza richiesta (m)
        // 1 kPa = 0.102 m di colonna d'acqua
        const prevalenzaM = perditeCarico * 0.102;
        
        // Stima della potenza elettrica del circolatore (W)
        // Assumiamo un rendimento del 50%
        const potenzaElettrica = (portataVolumetrica * prevalenzaM * 9.81 * densita) / 0.5;
        
        // Calcola il diametro consigliato per una velocità ottimale (1.0 m/s)
        const velocitaOttimale = 1.0; // m/s
        const area = portataVolumetrica / velocitaOttimale; // m²
        const diametroM = Math.sqrt((4 * area) / Math.PI);
        const diametroMm = diametroM * 1000;
        
        // Trova il diametro commerciale più vicino (ma superiore)
        let diametroConsigliato = diametriCommerciali[0];
        
        for (let i = 0; i < diametriCommerciali.length; i++) {
            if (diametriCommerciali[i] >= diametroMm) {
                diametroConsigliato = diametriCommerciali[i];
                break;
            }
            
            // Se siamo all'ultimo elemento e ancora non abbiamo trovato un diametro adeguato
            if (i === diametriCommerciali.length - 1) {
                diametroConsigliato = diametriCommerciali[i];
            }
        }
        
        // Calcola la velocità effettiva con il diametro commerciale
        const areaEffettiva = Math.PI * Math.pow((diametroConsigliato / 1000) / 2, 2); // m²
        const velocitaEffettiva = portataVolumetrica / areaEffettiva; // m/s
        
        // Mostra i risultati
        document.getElementById('portata-risultato').textContent = `${portataM3h.toFixed(2)} m³/h (${portataLs.toFixed(2)} l/s)`;
        document.getElementById('prevalenza-risultato').textContent = `${prevalenzaM.toFixed(2)} m`;
        document.getElementById('potenza-elettrica').textContent = `${(potenzaElettrica / 1000).toFixed(2)} kW`;
        document.getElementById('diametro-consigliato').textContent = `${diametroConsigliato} mm`;
        document.getElementById('velocita-circuito').textContent = `${velocitaEffettiva.toFixed(2)} m/s`;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 