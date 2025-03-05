document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-temperature');
    
    // Funzioni di conversione da ogni unità a Celsius
    const toCelsius = {
        celsius: (t) => t,
        fahrenheit: (t) => (t - 32) * 5/9,
        kelvin: (t) => t - 273.15,
        rankine: (t) => (t - 491.67) * 5/9,
        reaumur: (t) => t * 5/4
    };
    
    // Funzioni di conversione da Celsius a ogni unità
    const fromCelsius = {
        celsius: (t) => t,
        fahrenheit: (t) => t * 9/5 + 32,
        kelvin: (t) => t + 273.15,
        rankine: (t) => (t + 273.15) * 9/5,
        reaumur: (t) => t * 4/5
    };
    
    // Formule di conversione per la visualizzazione
    const formule = {
        'celsius-fahrenheit': 'T(°F) = T(°C) × 9/5 + 32',
        'celsius-kelvin': 'T(K) = T(°C) + 273.15',
        'celsius-rankine': 'T(°R) = (T(°C) + 273.15) × 9/5',
        'celsius-reaumur': 'T(°Ré) = T(°C) × 4/5',
        'fahrenheit-celsius': 'T(°C) = (T(°F) - 32) × 5/9',
        'fahrenheit-kelvin': 'T(K) = (T(°F) - 32) × 5/9 + 273.15',
        'fahrenheit-rankine': 'T(°R) = T(°F) + 459.67',
        'fahrenheit-reaumur': 'T(°Ré) = (T(°F) - 32) × 4/9',
        'kelvin-celsius': 'T(°C) = T(K) - 273.15',
        'kelvin-fahrenheit': 'T(°F) = T(K) × 9/5 - 459.67',
        'kelvin-rankine': 'T(°R) = T(K) × 9/5',
        'kelvin-reaumur': 'T(°Ré) = (T(K) - 273.15) × 4/5',
        'rankine-celsius': 'T(°C) = (T(°R) - 491.67) × 5/9',
        'rankine-fahrenheit': 'T(°F) = T(°R) - 459.67',
        'rankine-kelvin': 'T(K) = T(°R) × 5/9',
        'rankine-reaumur': 'T(°Ré) = (T(°R) - 491.67) × 4/9',
        'reaumur-celsius': 'T(°C) = T(°Ré) × 5/4',
        'reaumur-fahrenheit': 'T(°F) = T(°Ré) × 9/4 + 32',
        'reaumur-kelvin': 'T(K) = T(°Ré) × 5/4 + 273.15',
        'reaumur-rankine': 'T(°R) = (T(°Ré) × 5/4 + 273.15) × 9/5'
    };
    
    // Simboli delle unità di temperatura
    const simboli = {
        celsius: '°C',
        fahrenheit: '°F',
        kelvin: 'K',
        rankine: '°R',
        reaumur: '°Ré'
    };
    
    // Nomi completi delle unità di temperatura
    const nomi = {
        celsius: 'Celsius',
        fahrenheit: 'Fahrenheit',
        kelvin: 'Kelvin',
        rankine: 'Rankine',
        reaumur: 'Réaumur'
    };
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const valore = parseFloat(document.getElementById('valore').value);
        const unitaDa = document.getElementById('unita-da').value;
        const unitaA = document.getElementById('unita-a').value;
        
        // Converti prima in Celsius, poi nell'unità di destinazione
        const celsius = toCelsius[unitaDa](valore);
        const risultato = fromCelsius[unitaA](celsius);
        
        // Arrotonda il risultato a 2 decimali
        const risultatoArrotondato = Math.round(risultato * 100) / 100;
        
        // Mostra il risultato
        document.getElementById('valore-convertito').textContent = `${risultatoArrotondato} ${simboli[unitaA]}`;
        
        // Mostra la formula utilizzata
        const chiaveFormula = `${unitaDa}-${unitaA}`;
        document.getElementById('formula-utilizzata').textContent = formule[chiaveFormula] || 'Conversione tramite Celsius';
        
        // Calcola e mostra tutte le conversioni
        const tutteConversioni = document.getElementById('tutte-conversioni');
        tutteConversioni.innerHTML = '';
        
        const table = document.createElement('table');
        table.className = 'conversioni-tabella';
        
        // Crea l'intestazione della tabella
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const thUnita = document.createElement('th');
        thUnita.textContent = 'Unità';
        headerRow.appendChild(thUnita);
        
        const thValore = document.createElement('th');
        thValore.textContent = 'Valore';
        headerRow.appendChild(thValore);
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Crea il corpo della tabella
        const tbody = document.createElement('tbody');
        
        Object.keys(nomi).forEach(unita => {
            const row = document.createElement('tr');
            
            const tdUnita = document.createElement('td');
            tdUnita.textContent = `${nomi[unita]} (${simboli[unita]})`;
            row.appendChild(tdUnita);
            
            const tdValore = document.createElement('td');
            const valoreConvertito = fromCelsius[unita](celsius);
            tdValore.textContent = Math.round(valoreConvertito * 100) / 100;
            
            // Evidenzia l'unità di destinazione
            if (unita === unitaA) {
                row.className = 'riga-evidenziata';
            }
            
            row.appendChild(tdValore);
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tutteConversioni.appendChild(table);
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 