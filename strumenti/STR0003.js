document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-potenza');
    const tipoCalcoloSelect = document.getElementById('tipo-calcolo');
    const sezioneEdificio = document.getElementById('sezione-edificio');
    const sezioneAcs = document.getElementById('sezione-acs');
    
    // Coefficienti di fabbisogno energetico per classe energetica (kWh/m²anno)
    const coefficientiRiscaldamento = {
        'a4': 10,
        'a3': 20,
        'a2': 30,
        'a1': 40,
        'b': 60,
        'c': 90,
        'd': 130,
        'e': 170,
        'f': 210,
        'g': 250
    };
    
    const coefficientiRaffrescamento = {
        'a4': 5,
        'a3': 10,
        'a2': 15,
        'a1': 20,
        'b': 30,
        'c': 45,
        'd': 65,
        'e': 85,
        'f': 105,
        'g': 125
    };
    
    // Gradi giorno per zona climatica
    const gradiGiorno = {
        'a': 600,
        'b': 900,
        'c': 1400,
        'd': 2100,
        'e': 3000,
        'f': 4000
    };
    
    // Mostra/nascondi sezioni in base al tipo di calcolo
    tipoCalcoloSelect.addEventListener('change', () => {
        const tipoCalcolo = tipoCalcoloSelect.value;
        
        if (tipoCalcolo === 'acs') {
            sezioneEdificio.classList.add('hidden');
            sezioneAcs.classList.remove('hidden');
        } else {
            sezioneEdificio.classList.remove('hidden');
            sezioneAcs.classList.add('hidden');
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const tipoCalcolo = tipoCalcoloSelect.value;
        let potenzaKW = 0;
        let fabbisognoAnnuo = 0;
        let valoreSpecifico = 0;
        let labelSpecifico = '';
        
        if (tipoCalcolo === 'acs') {
            // Calcolo per acqua calda sanitaria
            const persone = parseInt(document.getElementById('persone').value);
            const consumoGiornaliero = parseInt(document.getElementById('consumo-giornaliero').value);
            const tempIngresso = parseInt(document.getElementById('temperatura-ingresso').value);
            const tempUscita = parseInt(document.getElementById('temperatura-uscita').value);
            
            // Calcolo del volume d'acqua giornaliero
            const volumeGiornaliero = persone * consumoGiornaliero; // litri
            
            // Calcolo dell'energia necessaria per riscaldare l'acqua
            // E = m * c * ΔT
            // Dove:
            // E = energia (kJ)
            // m = massa dell'acqua (kg)
            // c = calore specifico dell'acqua (4.186 kJ/kg°C)
            // ΔT = differenza di temperatura (°C)
            
            const massaAcqua = volumeGiornaliero; // 1 litro = 1 kg
            const caloreSpecifico = 4.186; // kJ/kg°C
            const deltaTempAcs = tempUscita - tempIngresso;
            
            // Energia giornaliera in kJ
            const energiaGiornalieraKJ = massaAcqua * caloreSpecifico * deltaTempAcs;
            
            // Converti in kWh (1 kWh = 3600 kJ)
            const energiaGiornalieraKWh = energiaGiornalieraKJ / 3600;
            
            // Calcola il fabbisogno annuo
            fabbisognoAnnuo = energiaGiornalieraKWh * 365;
            
            // Calcola la potenza necessaria (assumendo 2 ore di utilizzo al giorno)
            potenzaKW = energiaGiornalieraKWh / 2;
            
            // Valore specifico: consumo per persona
            valoreSpecifico = fabbisognoAnnuo / persone;
            labelSpecifico = 'Consumo annuo per persona:';
            
        } else {
            // Calcolo per riscaldamento o raffrescamento
            const superficie = parseFloat(document.getElementById('superficie').value);
            const altezza = parseFloat(document.getElementById('altezza').value);
            const classeEnergetica = document.getElementById('classe-energetica').value;
            const zonaClimatica = document.getElementById('zona-climatica').value;
            
            // Volume dell'edificio
            const volume = superficie * altezza;
            
            if (tipoCalcolo === 'riscaldamento') {
                // Fabbisogno energetico annuo per riscaldamento
                const coefficiente = coefficientiRiscaldamento[classeEnergetica];
                fabbisognoAnnuo = superficie * coefficiente;
                
                // Calcola la potenza termica necessaria
                // Utilizziamo un metodo semplificato basato sui gradi giorno
                const gg = gradiGiorno[zonaClimatica];
                const oreStagioneRiscaldamento = gg * 24;
                
                // Potenza in kW
                potenzaKW = (fabbisognoAnnuo / oreStagioneRiscaldamento) * 1000;
                
                // Valore specifico: potenza per m²
                valoreSpecifico = potenzaKW / superficie;
                labelSpecifico = 'Potenza specifica:';
                
            } else if (tipoCalcolo === 'raffrescamento') {
                // Fabbisogno energetico annuo per raffrescamento
                const coefficiente = coefficientiRaffrescamento[classeEnergetica];
                fabbisognoAnnuo = superficie * coefficiente;
                
                // Calcola la potenza termica necessaria
                // Assumiamo 1000 ore di funzionamento per la stagione estiva
                const oreStagioneRaffrescamento = 1000;
                
                // Potenza in kW
                potenzaKW = (fabbisognoAnnuo / oreStagioneRaffrescamento) * 1000;
                
                // Valore specifico: potenza per m³
                valoreSpecifico = potenzaKW / volume;
                labelSpecifico = 'Potenza specifica volumetrica:';
            }
        }
        
        // Mostra i risultati
        document.getElementById('potenza-termica').textContent = `${potenzaKW.toFixed(2)} kW`;
        document.getElementById('fabbisogno-annuo').textContent = `${fabbisognoAnnuo.toFixed(2)} kWh/anno`;
        document.getElementById('label-specifico').textContent = labelSpecifico;
        
        if (tipoCalcolo === 'riscaldamento') {
            document.getElementById('valore-specifico').textContent = `${valoreSpecifico.toFixed(2)} W/m²`;
        } else if (tipoCalcolo === 'raffrescamento') {
            document.getElementById('valore-specifico').textContent = `${valoreSpecifico.toFixed(2)} W/m³`;
        } else {
            document.getElementById('valore-specifico').textContent = `${valoreSpecifico.toFixed(2)} kWh/persona/anno`;
        }
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
    
    // Inizializza la visualizzazione corretta
    tipoCalcoloSelect.dispatchEvent(new Event('change'));
}); 