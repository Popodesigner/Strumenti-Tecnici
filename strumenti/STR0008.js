document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-pdc');
    const tipoPdcSelect = document.getElementById('tipo-pdc');
    const acsSelect = document.getElementById('acs');
    const personeInput = document.getElementById('persone');
    
    // Fattori di correzione per il COP in base al tipo di PDC e temperature
    const fattoriCOP = {
        'aria-acqua': {
            // Temperatura esterna: [COP a 35°C, COP a 45°C, COP a 55°C]
            '-15': [2.0, 1.7, 1.4],
            '-10': [2.3, 2.0, 1.7],
            '-5': [2.7, 2.3, 1.9],
            '0': [3.1, 2.7, 2.2],
            '5': [3.6, 3.1, 2.5],
            '10': [4.1, 3.5, 2.9],
            '15': [4.7, 4.0, 3.3]
        },
        'acqua-acqua': {
            // Temperatura sorgente: [COP a 35°C, COP a 45°C, COP a 55°C]
            '5': [4.0, 3.4, 2.8],
            '10': [4.6, 3.9, 3.2],
            '15': [5.2, 4.4, 3.6],
            '20': [5.8, 4.9, 4.0]
        },
        'geotermica': {
            // Temperatura sorgente: [COP a 35°C, COP a 45°C, COP a 55°C]
            '0': [4.2, 3.6, 3.0],
            '5': [4.7, 4.0, 3.3],
            '10': [5.2, 4.4, 3.6],
            '15': [5.7, 4.8, 3.9]
        }
    };
    
    // Gradi giorno per zona climatica (valori medi)
    const gradiGiorno = {
        'A': 600,
        'B': 900,
        'C': 1400,
        'D': 2100,
        'E': 3000,
        'F': 4000
    };
    
    // Mostra/nascondi il campo persone in base alla selezione ACS
    acsSelect.addEventListener('change', () => {
        const acsValue = acsSelect.value;
        const personeGroup = personeInput.closest('.form-group');
        
        if (acsValue === 'si') {
            personeGroup.style.display = 'block';
        } else {
            personeGroup.style.display = 'none';
        }
    });
    
    // Inizializza la visualizzazione
    acsSelect.dispatchEvent(new Event('change'));
    
    // Funzione per interpolare il COP
    function interpolaCOP(tipo, temperaturaEst, temperaturaMandata) {
        const temperature = Object.keys(fattoriCOP[tipo]).map(Number).sort((a, b) => a - b);
        
        // Se la temperatura è esattamente una di quelle nella tabella
        if (temperaturaEst.toString() in fattoriCOP[tipo]) {
            const copValues = fattoriCOP[tipo][temperaturaEst.toString()];
            
            // Interpola in base alla temperatura di mandata
            if (temperaturaMandata <= 35) {
                return copValues[0];
            } else if (temperaturaMandata >= 55) {
                return copValues[2];
            } else {
                // Interpolazione lineare tra 35°C e 55°C
                const ratio = (temperaturaMandata - 35) / 20;
                return copValues[0] + ratio * (copValues[2] - copValues[0]);
            }
        }
        
        // Trova le temperature più vicine per interpolare
        let tempInf = temperature[0];
        let tempSup = temperature[temperature.length - 1];
        
        for (let i = 0; i < temperature.length - 1; i++) {
            if (temperaturaEst >= temperature[i] && temperaturaEst <= temperature[i + 1]) {
                tempInf = temperature[i];
                tempSup = temperature[i + 1];
                break;
            }
        }
        
        // Se la temperatura è fuori dai limiti, usa il valore più vicino
        if (temperaturaEst < tempInf) {
            const copValues = fattoriCOP[tipo][tempInf.toString()];
            
            if (temperaturaMandata <= 35) {
                return copValues[0];
            } else if (temperaturaMandata >= 55) {
                return copValues[2];
            } else {
                const ratio = (temperaturaMandata - 35) / 20;
                return copValues[0] + ratio * (copValues[2] - copValues[0]);
            }
        }
        
        if (temperaturaEst > tempSup) {
            const copValues = fattoriCOP[tipo][tempSup.toString()];
            
            if (temperaturaMandata <= 35) {
                return copValues[0];
            } else if (temperaturaMandata >= 55) {
                return copValues[2];
            } else {
                const ratio = (temperaturaMandata - 35) / 20;
                return copValues[0] + ratio * (copValues[2] - copValues[0]);
            }
        }
        
        // Interpola tra le due temperature
        const copInf = fattoriCOP[tipo][tempInf.toString()];
        const copSup = fattoriCOP[tipo][tempSup.toString()];
        
        let copInterpolato;
        
        if (temperaturaMandata <= 35) {
            // Usa i valori per 35°C
            copInterpolato = copInf[0] + (temperaturaEst - tempInf) / (tempSup - tempInf) * (copSup[0] - copInf[0]);
        } else if (temperaturaMandata >= 55) {
            // Usa i valori per 55°C
            copInterpolato = copInf[2] + (temperaturaEst - tempInf) / (tempSup - tempInf) * (copSup[2] - copInf[2]);
        } else {
            // Interpola anche per la temperatura di mandata
            const ratio = (temperaturaMandata - 35) / 20;
            const copInfInterpolato = copInf[0] + ratio * (copInf[2] - copInf[0]);
            const copSupInterpolato = copSup[0] + ratio * (copSup[2] - copSup[0]);
            
            copInterpolato = copInfInterpolato + (temperaturaEst - tempInf) / (tempSup - tempInf) * (copSupInterpolato - copInfInterpolato);
        }
        
        return copInterpolato;
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const tipoPdc = tipoPdcSelect.value;
        const fabbisognoTermico = parseFloat(document.getElementById('fabbisogno-termico').value);
        const temperaturaEsterna = parseFloat(document.getElementById('temperatura-esterna').value);
        const temperaturaMandata = parseFloat(document.getElementById('temperatura-mandata').value);
        const zonaClimatica = document.getElementById('zona-climatica').value;
        const superficie = parseFloat(document.getElementById('superficie').value);
        const tipoTerminali = document.getElementById('tipo-terminali').value;
        const acs = acsSelect.value;
        const persone = parseInt(document.getElementById('persone').value);
        
        // Calcola il fattore di sovradimensionamento in base al tipo di terminali
        let fattoreSovradimensionamento;
        switch (tipoTerminali) {
            case 'pavimento':
                fattoreSovradimensionamento = 1.1;
                break;
            case 'parete':
                fattoreSovradimensionamento = 1.15;
                break;
            case 'ventilconvettori':
                fattoreSovradimensionamento = 1.2;
                break;
            case 'radiatori':
                fattoreSovradimensionamento = 1.3;
                break;
            default:
                fattoreSovradimensionamento = 1.2;
        }
        
        // Calcola la potenza consigliata per il riscaldamento
        let potenzaConsigliata = fabbisognoTermico * fattoreSovradimensionamento;
        
        // Aggiungi potenza per ACS se richiesto
        let fabbisognoACS = 0;
        if (acs === 'si') {
            // Stima 50 litri/persona/giorno a 45°C
            const litriGiorno = persone * 50;
            // Energia per scaldare l'acqua: m * c * ΔT
            // Assumiamo acqua fredda a 10°C
            const deltaT = 45 - 10;
            // Energia in kWh: litri * 4.186 * deltaT / 3600 / 1000
            fabbisognoACS = litriGiorno * 4.186 * deltaT / 3600;
            
            // Aggiungi potenza per ACS (assumendo 2 ore di riscaldamento)
            potenzaConsigliata += fabbisognoACS / 2;
        }
        
        // Calcola il COP stimato
        const copStimato = interpolaCOP(tipoPdc, temperaturaEsterna, temperaturaMandata);
        
        // Calcola il consumo elettrico stimato
        const consumoElettrico = potenzaConsigliata / copStimato;
        
        // Calcola il volume di accumulo consigliato
        let volumeAccumulo;
        if (acs === 'si') {
            // Minimo 50 litri per persona + buffer
            volumeAccumulo = Math.max(200, persone * 50 * 1.2);
        } else {
            // Solo per riscaldamento: 20-25 litri per kW
            volumeAccumulo = potenzaConsigliata * 25;
        }
        
        // Calcola la potenza specifica (W/m²)
        const potenzaSpecifica = (potenzaConsigliata * 1000) / superficie;
        
        // Stima della classe energetica in base alla potenza specifica
        let classeEnergetica;
        if (potenzaSpecifica < 30) {
            classeEnergetica = 'A4';
        } else if (potenzaSpecifica < 50) {
            classeEnergetica = 'A3';
        } else if (potenzaSpecifica < 70) {
            classeEnergetica = 'A2';
        } else if (potenzaSpecifica < 90) {
            classeEnergetica = 'A1';
        } else if (potenzaSpecifica < 120) {
            classeEnergetica = 'B';
        } else if (potenzaSpecifica < 160) {
            classeEnergetica = 'C';
        } else if (potenzaSpecifica < 200) {
            classeEnergetica = 'D';
        } else if (potenzaSpecifica < 250) {
            classeEnergetica = 'E';
        } else if (potenzaSpecifica < 300) {
            classeEnergetica = 'F';
        } else {
            classeEnergetica = 'G';
        }
        
        // Mostra i risultati
        document.getElementById('potenza-consigliata').textContent = `${potenzaConsigliata.toFixed(2)} kW`;
        document.getElementById('cop-stimato').textContent = `${copStimato.toFixed(2)}`;
        document.getElementById('consumo-elettrico').textContent = `${consumoElettrico.toFixed(2)} kW`;
        
        if (acs === 'si') {
            document.getElementById('fabbisogno-acs').textContent = `${fabbisognoACS.toFixed(2)} kWh/giorno`;
        } else {
            document.getElementById('fabbisogno-acs').textContent = 'N/A';
        }
        
        document.getElementById('volume-accumulo').textContent = `${Math.round(volumeAccumulo)} litri`;
        document.getElementById('potenza-specifica').textContent = `${potenzaSpecifica.toFixed(1)} W/m²`;
        document.getElementById('classe-energetica').textContent = classeEnergetica;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 