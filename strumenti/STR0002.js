document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-portata');
    const fluidoSelect = document.getElementById('fluido');
    
    // Proprietà dei fluidi a diverse temperature
    const proprietaFluidi = {
        'acqua': {
            // Temperatura (°C): [densità (kg/m³), viscosità (Pa·s)]
            0: [999.8, 1.792e-3],
            10: [999.7, 1.307e-3],
            20: [998.2, 1.002e-3],
            30: [995.7, 0.798e-3],
            40: [992.2, 0.653e-3],
            50: [988.0, 0.547e-3],
            60: [983.2, 0.467e-3],
            70: [977.8, 0.404e-3],
            80: [971.8, 0.355e-3],
            90: [965.3, 0.315e-3],
            100: [958.4, 0.282e-3]
        },
        'glicole10': {
            // Temperatura (°C): [densità (kg/m³), viscosità (Pa·s)]
            0: [1018.0, 2.60e-3],
            20: [1015.0, 1.40e-3],
            40: [1008.0, 0.85e-3],
            60: [1000.0, 0.56e-3],
            80: [990.0, 0.40e-3]
        },
        'glicole20': {
            // Temperatura (°C): [densità (kg/m³), viscosità (Pa·s)]
            0: [1033.0, 3.80e-3],
            20: [1029.0, 1.90e-3],
            40: [1022.0, 1.10e-3],
            60: [1014.0, 0.70e-3],
            80: [1005.0, 0.48e-3]
        },
        'glicole30': {
            // Temperatura (°C): [densità (kg/m³), viscosità (Pa·s)]
            0: [1048.0, 5.50e-3],
            20: [1043.0, 2.50e-3],
            40: [1036.0, 1.40e-3],
            60: [1028.0, 0.85e-3],
            80: [1019.0, 0.58e-3]
        }
    };
    
    // Funzione per interpolare le proprietà del fluido in base alla temperatura
    function interpolaProprietaFluido(fluido, temperatura) {
        const proprietaFluido = proprietaFluidi[fluido];
        const temperature = Object.keys(proprietaFluido).map(Number).sort((a, b) => a - b);
        
        // Se la temperatura è esattamente una di quelle nella tabella
        if (temperatura in proprietaFluido) {
            return proprietaFluido[temperatura];
        }
        
        // Trova le temperature più vicine per interpolare
        let tempInf = temperature[0];
        let tempSup = temperature[temperature.length - 1];
        
        for (let i = 0; i < temperature.length; i++) {
            if (temperature[i] > temperatura) {
                tempSup = temperatures[i];
                tempInf = temperatures[i - 1];
                break;
            }
        }
        
        // Interpola linearmente
        const factor = (temperatura - tempInf) / (tempSup - tempInf);
        const densitaInf = proprietaFluido[tempInf][0];
        const densitaSup = proprietaFluido[tempSup][0];
        const viscositaInf = proprietaFluido[tempInf][1];
        const viscositaSup = proprietaFluido[tempSup][1];
        
        const densita = densitaInf + factor * (densitaSup - densitaInf);
        const viscosita = viscositaInf + factor * (viscositaSup - viscositaInf);
        
        return [densita, viscosita];
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const prevalenza = parseFloat(document.getElementById('prevalenza').value);
        const potenza = parseFloat(document.getElementById('potenza').value);
        const rendimento = parseFloat(document.getElementById('rendimento').value) / 100; // Converti da percentuale a decimale
        const temperatura = parseFloat(document.getElementById('temperatura').value);
        const fluido = document.getElementById('fluido').value;
        
        // Ottieni le proprietà del fluido alla temperatura specificata
        let [densita, viscosita] = [998.2, 1.002e-3]; // Valori predefiniti per acqua a 20°C
        
        try {
            [densita, viscosita] = interpolaProprietaFluido(fluido, temperatura);
        } catch (error) {
            console.error('Errore nell\'interpolazione delle proprietà del fluido:', error);
        }
        
        // Calcola la portata usando la formula della potenza idraulica
        // P = ρ * g * Q * H / η
        // Dove:
        // P = potenza (W)
        // ρ = densità del fluido (kg/m³)
        // g = accelerazione di gravità (9.81 m/s²)
        // Q = portata volumetrica (m³/s)
        // H = prevalenza (m)
        // η = rendimento
        
        const g = 9.81; // m/s²
        const potenzaW = potenza * 1000; // Converti da kW a W
        
        // Risolvi per Q
        const portataM3s = potenzaW * rendimento / (densita * g * prevalenza);
        
        // Converti in l/s e m³/h
        const portataLs = portataM3s * 1000;
        const portataM3h = portataM3s * 3600;
        
        // Calcola il diametro consigliato per una velocità ottimale (1.5 m/s)
        const velocitaOttimale = 1.5; // m/s
        const area = portataM3s / velocitaOttimale; // m²
        const diametroM = Math.sqrt((4 * area) / Math.PI);
        const diametroMm = diametroM * 1000;
        
        // Arrotonda al diametro commerciale più vicino
        const diametriCommerciali = [10, 15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300];
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
        
        // Mostra i risultati
        document.getElementById('portata-risultato').textContent = `${portataLs.toFixed(2)} l/s`;
        document.getElementById('portata-volumetrica').textContent = `${portataM3h.toFixed(2)} m³/h`;
        document.getElementById('velocita-consigliata').textContent = `${velocitaOttimale.toFixed(1)} m/s`;
        document.getElementById('diametro-consigliato').textContent = `${diametroConsigliato} mm`;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 