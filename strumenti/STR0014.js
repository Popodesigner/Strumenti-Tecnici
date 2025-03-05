document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-convertitore');
    const categoriaSelect = document.getElementById('categoria');
    const unitaDaSelect = document.getElementById('unita-da');
    const unitaASelect = document.getElementById('unita-a');
    
    // Definizione delle unità di misura per ogni categoria
    const unita = {
        lunghezza: [
            { nome: 'Millimetri (mm)', valore: 0.001 },
            { nome: 'Centimetri (cm)', valore: 0.01 },
            { nome: 'Metri (m)', valore: 1 },
            { nome: 'Chilometri (km)', valore: 1000 },
            { nome: 'Pollici (in)', valore: 0.0254 },
            { nome: 'Piedi (ft)', valore: 0.3048 },
            { nome: 'Iarde (yd)', valore: 0.9144 },
            { nome: 'Miglia (mi)', valore: 1609.344 }
        ],
        area: [
            { nome: 'Millimetri quadrati (mm²)', valore: 0.000001 },
            { nome: 'Centimetri quadrati (cm²)', valore: 0.0001 },
            { nome: 'Metri quadrati (m²)', valore: 1 },
            { nome: 'Ettari (ha)', valore: 10000 },
            { nome: 'Chilometri quadrati (km²)', valore: 1000000 },
            { nome: 'Pollici quadrati (in²)', valore: 0.00064516 },
            { nome: 'Piedi quadrati (ft²)', valore: 0.09290304 },
            { nome: 'Iarde quadrate (yd²)', valore: 0.83612736 },
            { nome: 'Acri (ac)', valore: 4046.8564224 },
            { nome: 'Miglia quadrate (mi²)', valore: 2589988.110336 }
        ],
        volume: [
            { nome: 'Millilitri (ml)', valore: 0.000001 },
            { nome: 'Centimetri cubi (cm³)', valore: 0.000001 },
            { nome: 'Litri (l)', valore: 0.001 },
            { nome: 'Metri cubi (m³)', valore: 1 },
            { nome: 'Pollici cubi (in³)', valore: 0.000016387064 },
            { nome: 'Piedi cubi (ft³)', valore: 0.028316846592 },
            { nome: 'Galloni US (gal)', valore: 0.003785411784 },
            { nome: 'Galloni UK (gal)', valore: 0.00454609 }
        ],
        massa: [
            { nome: 'Milligrammi (mg)', valore: 0.000001 },
            { nome: 'Grammi (g)', valore: 0.001 },
            { nome: 'Chilogrammi (kg)', valore: 1 },
            { nome: 'Tonnellate (t)', valore: 1000 },
            { nome: 'Once (oz)', valore: 0.028349523125 },
            { nome: 'Libbre (lb)', valore: 0.45359237 },
            { nome: 'Stone (st)', valore: 6.35029318 },
            { nome: 'Tonnellate corte (US)', valore: 907.18474 },
            { nome: 'Tonnellate lunghe (UK)', valore: 1016.0469088 }
        ],
        velocita: [
            { nome: 'Metri al secondo (m/s)', valore: 1 },
            { nome: 'Chilometri all\'ora (km/h)', valore: 0.277777778 },
            { nome: 'Piedi al secondo (ft/s)', valore: 0.3048 },
            { nome: 'Miglia all\'ora (mph)', valore: 0.44704 },
            { nome: 'Nodi (kn)', valore: 0.514444444 }
        ],
        tempo: [
            { nome: 'Millisecondi (ms)', valore: 0.001 },
            { nome: 'Secondi (s)', valore: 1 },
            { nome: 'Minuti (min)', valore: 60 },
            { nome: 'Ore (h)', valore: 3600 },
            { nome: 'Giorni (d)', valore: 86400 },
            { nome: 'Settimane (wk)', valore: 604800 },
            { nome: 'Mesi (30 giorni)', valore: 2592000 },
            { nome: 'Anni (365 giorni)', valore: 31536000 }
        ],
        energia: [
            { nome: 'Joule (J)', valore: 1 },
            { nome: 'Kilojoule (kJ)', valore: 1000 },
            { nome: 'Calorie (cal)', valore: 4.184 },
            { nome: 'Kilocalorie (kcal)', valore: 4184 },
            { nome: 'Wattora (Wh)', valore: 3600 },
            { nome: 'Kilowattora (kWh)', valore: 3600000 },
            { nome: 'Elettronvolt (eV)', valore: 1.602176634e-19 },
            { nome: 'British Thermal Unit (BTU)', valore: 1055.05585262 }
        ],
        potenza: [
            { nome: 'Watt (W)', valore: 1 },
            { nome: 'Kilowatt (kW)', valore: 1000 },
            { nome: 'Megawatt (MW)', valore: 1000000 },
            { nome: 'Cavalli vapore (CV)', valore: 735.49875 },
            { nome: 'Horsepower (HP)', valore: 745.699872 },
            { nome: 'BTU/ora', valore: 0.29307107 },
            { nome: 'Calorie/secondo (cal/s)', valore: 4.184 }
        ],
        portata: [
            { nome: 'Litri al secondo (l/s)', valore: 0.001 },
            { nome: 'Litri al minuto (l/min)', valore: 0.0000166667 },
            { nome: 'Metri cubi all\'ora (m³/h)', valore: 0.000277778 },
            { nome: 'Metri cubi al giorno (m³/d)', valore: 0.0000115741 },
            { nome: 'Galloni US al minuto (gpm)', valore: 0.0000630902 },
            { nome: 'Piedi cubi al secondo (cfs)', valore: 0.028316847 },
            { nome: 'Metri cubi al secondo (m³/s)', valore: 1 }
        ]
    };
    
    // Funzione per popolare i select delle unità
    function popolaUnitaSelect() {
        const categoria = categoriaSelect.value;
        const unitaCategoria = unita[categoria];
        
        // Svuota i select
        unitaDaSelect.innerHTML = '';
        unitaASelect.innerHTML = '';
        
        // Popola i select con le unità della categoria selezionata
        unitaCategoria.forEach((u, index) => {
            const optionDa = document.createElement('option');
            optionDa.value = index;
            optionDa.textContent = u.nome;
            unitaDaSelect.appendChild(optionDa);
            
            const optionA = document.createElement('option');
            optionA.value = index;
            optionA.textContent = u.nome;
            unitaASelect.appendChild(optionA);
        });
        
        // Seleziona un'unità diversa nel secondo select
        if (unitaASelect.options.length > 1) {
            unitaASelect.selectedIndex = 1;
        }
    }
    
    // Popola i select quando cambia la categoria
    categoriaSelect.addEventListener('change', popolaUnitaSelect);
    
    // Popola i select all'avvio
    popolaUnitaSelect();
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const categoria = categoriaSelect.value;
        const valore = parseFloat(document.getElementById('valore').value);
        const unitaDaIndex = parseInt(unitaDaSelect.value);
        const unitaAIndex = parseInt(unitaASelect.value);
        
        // Recupera le unità selezionate
        const unitaCategoria = unita[categoria];
        const unitaDa = unitaCategoria[unitaDaIndex];
        const unitaA = unitaCategoria[unitaAIndex];
        
        // Calcola il valore convertito
        // Prima converti in unità base, poi converti nell'unità di destinazione
        const valoreBase = valore * unitaDa.valore;
        const valoreConvertito = valoreBase / unitaA.valore;
        
        // Crea la formula di conversione
        let formula = `${valore} ${unitaDa.nome} = ${valoreConvertito.toLocaleString('it-IT')} ${unitaA.nome}`;
        
        // Mostra i risultati
        document.getElementById('valore-convertito').textContent = `${valoreConvertito.toLocaleString('it-IT')} ${unitaA.nome}`;
        document.getElementById('formula-conversione').textContent = formula;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 