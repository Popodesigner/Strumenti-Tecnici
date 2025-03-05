document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-efficienza');
    const tipoCaldaiaSelect = document.getElementById('tipo-caldaia');
    const combustibileSelect = document.getElementById('combustibile');
    const unitaMisuraSelect = document.getElementById('unita-misura');
    
    // Potere calorifico inferiore dei combustibili (kWh/unità)
    const poteriCalorifici = {
        'metano': {
            'm3': 9.97 // kWh/m³
        },
        'gpl': {
            'kg': 12.8, // kWh/kg
            'l': 6.82 // kWh/l
        },
        'gasolio': {
            'l': 10.0, // kWh/l
            'kg': 11.86 // kWh/kg
        },
        'pellet': {
            'kg': 4.9 // kWh/kg
        },
        'legna': {
            'kg': 4.0 // kWh/kg
        }
    };
    
    // Classi di efficienza per le caldaie
    const classiEfficienza = {
        'tradizionale': {
            'A': 90,
            'B': 86,
            'C': 82,
            'D': 78,
            'E': 74,
            'F': 70,
            'G': 0
        },
        'condensazione': {
            'A+++': 98,
            'A++': 96,
            'A+': 94,
            'A': 90,
            'B': 86,
            'C': 82,
            'D': 0
        },
        'biomassa': {
            'A+': 88,
            'A': 80,
            'B': 75,
            'C': 70,
            'D': 65,
            'E': 60,
            'F': 0
        }
    };
    
    // Aggiorna le unità di misura disponibili in base al combustibile selezionato
    combustibileSelect.addEventListener('change', () => {
        const combustibile = combustibileSelect.value;
        
        // Svuota il select delle unità di misura
        unitaMisuraSelect.innerHTML = '';
        
        // Aggiungi le opzioni appropriate
        if (combustibile === 'metano') {
            aggiungiOpzione(unitaMisuraSelect, 'm3', 'm³ (metano)');
        } else if (combustibile === 'gpl') {
            aggiungiOpzione(unitaMisuraSelect, 'kg', 'kg (GPL)');
            aggiungiOpzione(unitaMisuraSelect, 'l', 'litri (GPL)');
        } else if (combustibile === 'gasolio') {
            aggiungiOpzione(unitaMisuraSelect, 'l', 'litri (gasolio)');
            aggiungiOpzione(unitaMisuraSelect, 'kg', 'kg (gasolio)');
        } else if (combustibile === 'pellet') {
            aggiungiOpzione(unitaMisuraSelect, 'kg', 'kg (pellet)');
        } else if (combustibile === 'legna') {
            aggiungiOpzione(unitaMisuraSelect, 'kg', 'kg (legna)');
        }
    });
    
    // Funzione di supporto per aggiungere opzioni al select
    function aggiungiOpzione(selectElement, value, text) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        selectElement.appendChild(option);
    }
    
    // Inizializza le unità di misura
    combustibileSelect.dispatchEvent(new Event('change'));
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const tipoCaldaia = tipoCaldaiaSelect.value;
        const potenzaNominale = parseFloat(document.getElementById('potenza-nominale').value);
        const combustibile = combustibileSelect.value;
        const consumo = parseFloat(document.getElementById('consumo').value);
        const unitaMisura = unitaMisuraSelect.value;
        const temperaturaFumi = parseFloat(document.getElementById('temperatura-fumi').value);
        const temperaturaAmbiente = parseFloat(document.getElementById('temperatura-ambiente').value);
        const co2 = parseFloat(document.getElementById('co2').value);
        
        // Ottieni il potere calorifico del combustibile
        const potereCalorifico = poteriCalorifici[combustibile][unitaMisura];
        
        // Calcola l'energia in ingresso (kWh)
        const energiaIngresso = consumo * potereCalorifico;
        
        // Calcola le perdite per calore sensibile nei fumi
        // Formula semplificata: Perdite % = K * (Tf - Ta) / CO2
        // dove K è un coefficiente che dipende dal combustibile
        let coefficienteK;
        
        switch (combustibile) {
            case 'metano':
                coefficienteK = 0.37;
                break;
            case 'gpl':
                coefficienteK = 0.42;
                break;
            case 'gasolio':
                coefficienteK = 0.49;
                break;
            case 'pellet':
            case 'legna':
                coefficienteK = 0.57;
                break;
            default:
                coefficienteK = 0.4;
        }
        
        const perditeSensibilePercentuale = coefficienteK * (temperaturaFumi - temperaturaAmbiente) / co2;
        const perditeSensibile = (perditeSensibilePercentuale / 100) * energiaIngresso;
        
        // Stima delle perdite per incombusti (varia in base al tipo di caldaia e combustibile)
        let perditeIncombustiPercentuale;
        
        if (tipoCaldaia === 'tradizionale') {
            if (combustibile === 'metano' || combustibile === 'gpl') {
                perditeIncombustiPercentuale = 1.5;
            } else if (combustibile === 'gasolio') {
                perditeIncombustiPercentuale = 2.0;
            } else {
                perditeIncombustiPercentuale = 3.0;
            }
        } else if (tipoCaldaia === 'condensazione') {
            if (combustibile === 'metano' || combustibile === 'gpl') {
                perditeIncombustiPercentuale = 0.5;
            } else {
                perditeIncombustiPercentuale = 1.0;
            }
        } else { // biomassa
            if (combustibile === 'pellet') {
                perditeIncombustiPercentuale = 4.0;
            } else {
                perditeIncombustiPercentuale = 6.0;
            }
        }
        
        const perditeIncombusti = (perditeIncombustiPercentuale / 100) * energiaIngresso;
        
        // Calcola il rendimento di combustione
        const rendimentoCombustione = 100 - perditeSensibilePercentuale - perditeIncombustiPercentuale;
        
        // Stima del rendimento stagionale (considerando perdite per irraggiamento, stand-by, ecc.)
        // In genere è 4-8% inferiore al rendimento di combustione
        let perditeAggiuntive;
        
        if (tipoCaldaia === 'tradizionale') {
            perditeAggiuntive = 8;
        } else if (tipoCaldaia === 'condensazione') {
            perditeAggiuntive = 4;
        } else { // biomassa
            perditeAggiuntive = 6;
        }
        
        const rendimentoStagionale = rendimentoCombustione - perditeAggiuntive;
        
        // Determina la classe di efficienza
        let classeEfficienza = 'G';
        const classiDisponibili = Object.keys(classiEfficienza[tipoCaldaia]);
        
        for (let i = 0; i < classiDisponibili.length; i++) {
            const classe = classiDisponibili[i];
            const limiteInferiore = classiEfficienza[tipoCaldaia][classe];
            
            if (rendimentoStagionale >= limiteInferiore) {
                classeEfficienza = classe;
                break;
            }
        }
        
        // Mostra i risultati
        document.getElementById('potere-calorifico').textContent = `${potereCalorifico.toFixed(2)} kWh/${unitaMisura}`;
        document.getElementById('energia-ingresso').textContent = `${energiaIngresso.toFixed(2)} kWh`;
        document.getElementById('perdite-sensibile').textContent = `${perditeSensibile.toFixed(2)} kWh (${perditeSensibilePercentuale.toFixed(1)}%)`;
        document.getElementById('perdite-incombusti').textContent = `${perditeIncombusti.toFixed(2)} kWh (${perditeIncombustiPercentuale.toFixed(1)}%)`;
        document.getElementById('rendimento-combustione').textContent = `${rendimentoCombustione.toFixed(1)}%`;
        document.getElementById('rendimento-stagionale').textContent = `${rendimentoStagionale.toFixed(1)}%`;
        document.getElementById('classe-efficienza').textContent = classeEfficienza;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 