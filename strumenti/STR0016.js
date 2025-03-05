document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-pressioni');
    
    // Fattori di conversione rispetto al Pascal (Pa)
    const fattoriConversione = {
        pa: 1,
        kpa: 1000,
        mpa: 1000000,
        bar: 100000,
        mbar: 100,
        atm: 101325,
        mmhg: 133.322,
        mmh2o: 9.80665,
        psi: 6894.76,
        torr: 133.322
    };
    
    // Simboli delle unità di pressione
    const simboli = {
        pa: 'Pa',
        kpa: 'kPa',
        mpa: 'MPa',
        bar: 'bar',
        mbar: 'mbar',
        atm: 'atm',
        mmhg: 'mmHg',
        mmh2o: 'mmH₂O',
        psi: 'psi',
        torr: 'Torr'
    };
    
    // Nomi completi delle unità di pressione
    const nomi = {
        pa: 'Pascal',
        kpa: 'Kilopascal',
        mpa: 'Megapascal',
        bar: 'Bar',
        mbar: 'Millibar',
        atm: 'Atmosfera',
        mmhg: 'Millimetri di mercurio',
        mmh2o: 'Millimetri di colonna d\'acqua',
        psi: 'Libbre per pollice quadrato',
        torr: 'Torr'
    };
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const valore = parseFloat(document.getElementById('valore').value);
        const unitaDa = document.getElementById('unita-da').value;
        const unitaA = document.getElementById('unita-a').value;
        
        // Converti prima in Pascal, poi nell'unità di destinazione
        const pascal = valore * fattoriConversione[unitaDa];
        const risultato = pascal / fattoriConversione[unitaA];
        
        // Arrotonda il risultato a un numero appropriato di decimali
        let decimali = 2;
        if (risultato < 0.01) decimali = 6;
        else if (risultato < 0.1) decimali = 4;
        else if (risultato > 1000) decimali = 0;
        
        const risultatoArrotondato = risultato.toFixed(decimali);
        
        // Calcola il fattore di conversione
        const fattore = fattoriConversione[unitaA] / fattoriConversione[unitaDa];
        let fattoreFormattato;
        
        if (fattore < 0.001 || fattore > 1000) {
            fattoreFormattato = fattore.toExponential(4);
        } else {
            fattoreFormattato = fattore.toFixed(6);
        }
        
        // Mostra il risultato
        document.getElementById('valore-convertito').textContent = `${risultatoArrotondato} ${simboli[unitaA]}`;
        
        // Mostra il fattore di conversione
        document.getElementById('fattore-conversione').textContent = 
            `1 ${simboli[unitaDa]} = ${fattoreFormattato} ${simboli[unitaA]}`;
        
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
            const valoreConvertito = pascal / fattoriConversione[unita];
            
            // Determina il numero di decimali in base al valore
            let dec = 2;
            if (valoreConvertito < 0.01) dec = 6;
            else if (valoreConvertito < 0.1) dec = 4;
            else if (valoreConvertito > 1000) dec = 0;
            
            tdValore.textContent = valoreConvertito.toFixed(dec);
            
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