document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cavi');
    const tipoSistemaSelect = document.getElementById('tipo-sistema');
    const tensioneInput = document.getElementById('tensione');
    
    // Portate dei cavi in ampere per diverse sezioni (mm²)
    // Valori per PVC e EPR/XLPE, in aria e in tubo/canale/interrato
    const portateRame = {
        'pvc': {
            'aria': {
                1.5: 19,
                2.5: 26,
                4: 35,
                6: 46,
                10: 63,
                16: 85,
                25: 112,
                35: 138,
                50: 168,
                70: 213,
                95: 258,
                120: 299,
                150: 344,
                185: 392,
                240: 461
            },
            'tubo': {
                1.5: 14.5,
                2.5: 19.5,
                4: 26,
                6: 34,
                10: 46,
                16: 61,
                25: 80,
                35: 99,
                50: 119,
                70: 151,
                95: 182,
                120: 210,
                150: 240,
                185: 273,
                240: 321
            },
            'canale': {
                1.5: 15.5,
                2.5: 21,
                4: 28,
                6: 36,
                10: 50,
                16: 66,
                25: 87,
                35: 108,
                50: 130,
                70: 165,
                95: 200,
                120: 231,
                150: 265,
                185: 301,
                240: 354
            },
            'interrato': {
                1.5: 17,
                2.5: 22,
                4: 29,
                6: 37,
                10: 49,
                16: 64,
                25: 83,
                35: 101,
                50: 120,
                70: 150,
                95: 179,
                120: 205,
                150: 233,
                185: 263,
                240: 307
            }
        },
        'epr': {
            'aria': {
                1.5: 23,
                2.5: 31,
                4: 42,
                6: 54,
                10: 75,
                16: 100,
                25: 133,
                35: 164,
                50: 198,
                70: 253,
                95: 306,
                120: 354,
                150: 407,
                185: 464,
                240: 546
            },
            'tubo': {
                1.5: 17,
                2.5: 23,
                4: 31,
                6: 40,
                10: 54,
                16: 73,
                25: 95,
                35: 117,
                50: 141,
                70: 179,
                95: 216,
                120: 249,
                150: 285,
                185: 324,
                240: 380
            },
            'canale': {
                1.5: 18,
                2.5: 25,
                4: 33,
                6: 43,
                10: 59,
                16: 79,
                25: 104,
                35: 129,
                50: 155,
                70: 198,
                95: 239,
                120: 276,
                150: 318,
                185: 362,
                240: 424
            },
            'interrato': {
                1.5: 19,
                2.5: 26,
                4: 34,
                6: 44,
                10: 58,
                16: 77,
                25: 100,
                35: 121,
                50: 145,
                70: 180,
                95: 216,
                120: 249,
                150: 285,
                185: 324,
                240: 380
            }
        }
    };
    
    const portateAlluminio = {
        'pvc': {
            'aria': {
                16: 65,
                25: 87,
                35: 105,
                50: 128,
                70: 163,
                95: 197,
                120: 227,
                150: 259,
                185: 294,
                240: 344
            },
            'tubo': {
                16: 47,
                25: 63,
                35: 77,
                50: 93,
                70: 118,
                95: 142,
                120: 164,
                150: 187,
                185: 213,
                240: 249
            },
            'canale': {
                16: 51,
                25: 68,
                35: 83,
                50: 100,
                70: 127,
                95: 153,
                120: 177,
                150: 201,
                185: 229,
                240: 269
            },
            'interrato': {
                16: 49,
                25: 64,
                35: 78,
                50: 93,
                70: 117,
                95: 140,
                120: 160,
                150: 183,
                185: 207,
                240: 241
            }
        },
        'epr': {
            'aria': {
                16: 77,
                25: 102,
                35: 126,
                50: 153,
                70: 196,
                95: 238,
                120: 276,
                150: 319,
                185: 364,
                240: 430
            },
            'tubo': {
                16: 57,
                25: 75,
                35: 92,
                50: 111,
                70: 142,
                95: 172,
                120: 199,
                150: 228,
                185: 261,
                240: 307
            },
            'canale': {
                16: 62,
                25: 82,
                35: 101,
                50: 122,
                70: 156,
                95: 189,
                120: 219,
                150: 252,
                185: 288,
                240: 338
            },
            'interrato': {
                16: 60,
                25: 78,
                35: 96,
                50: 115,
                70: 143,
                95: 172,
                120: 198,
                150: 227,
                185: 258,
                240: 301
            }
        }
    };
    
    // Resistività dei materiali conduttori (Ohm·mm²/m)
    const resistivita = {
        'rame': 0.0178,
        'alluminio': 0.0294
    };
    
    // Sezioni commerciali dei cavi (mm²)
    const sezioniCommerciali = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
    
    // Aggiorna il valore di default della tensione in base al tipo di sistema
    tipoSistemaSelect.addEventListener('change', () => {
        const tipoSistema = tipoSistemaSelect.value;
        
        if (tipoSistema === 'monofase') {
            tensioneInput.value = 230;
        } else { // trifase
            tensioneInput.value = 400;
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const tipoSistema = tipoSistemaSelect.value;
        const potenza = parseFloat(document.getElementById('potenza').value);
        const tensione = parseFloat(document.getElementById('tensione').value);
        const fattorePotenza = parseFloat(document.getElementById('fattore-potenza').value);
        const lunghezza = parseFloat(document.getElementById('lunghezza').value);
        const materialeConduttore = document.getElementById('materiale-conduttore').value;
        const tipoIsolamento = document.getElementById('tipo-isolamento').value;
        const metodoPosa = document.getElementById('metodo-posa').value;
        const temperaturaAmbiente = parseFloat(document.getElementById('temperatura-ambiente').value);
        const cadutaTensioneMax = parseFloat(document.getElementById('caduta-tensione-max').value);
        
        // Calcola la corrente di impiego
        let correnteImpiego;
        
        if (tipoSistema === 'monofase') {
            correnteImpiego = (potenza * 1000) / (tensione * fattorePotenza);
        } else { // trifase
            correnteImpiego = (potenza * 1000) / (Math.sqrt(3) * tensione * fattorePotenza);
        }
        
        // Applica fattore di correzione per temperatura ambiente
        let fattoreTemperatura = 1.0;
        
        if (tipoIsolamento === 'pvc') {
            if (temperaturaAmbiente > 30) {
                fattoreTemperatura = 0.87; // Approssimazione per temperature > 30°C
            }
        } else { // epr
            if (temperaturaAmbiente > 30) {
                fattoreTemperatura = 0.91; // Approssimazione per temperature > 30°C
            }
        }
        
        // Calcola la corrente di progetto (considerando il fattore di temperatura)
        const correnteProgetto = correnteImpiego / fattoreTemperatura;
        
        // Determina la sezione minima per portata
        let sezionePortata = 0;
        let portateRiferimento;
        
        if (materialeConduttore === 'rame') {
            portateRiferimento = portateRame[tipoIsolamento][metodoPosa];
        } else { // alluminio
            portateRiferimento = portateAlluminio[tipoIsolamento][metodoPosa];
        }
        
        // Trova la sezione minima che supporta la corrente di progetto
        for (const sezione in portateRiferimento) {
            if (portateRiferimento[sezione] >= correnteProgetto) {
                sezionePortata = parseFloat(sezione);
                break;
            }
        }
        
        // Se non è stata trovata una sezione adeguata, usa la più grande disponibile
        if (sezionePortata === 0) {
            const sezioni = Object.keys(portateRiferimento).map(parseFloat);
            sezionePortata = Math.max(...sezioni);
        }
        
        // Calcola la sezione minima per caduta di tensione
        let sezioneCaduta;
        const resistivitaMateriale = resistivita[materialeConduttore];
        
        if (tipoSistema === 'monofase') {
            sezioneCaduta = (2 * resistivitaMateriale * lunghezza * correnteImpiego * 100) / (cadutaTensioneMax * tensione);
        } else { // trifase
            sezioneCaduta = (Math.sqrt(3) * resistivitaMateriale * lunghezza * correnteImpiego * 100) / (cadutaTensioneMax * tensione);
        }
        
        // Trova la sezione commerciale immediatamente superiore alla sezione calcolata per caduta di tensione
        let sezioneCommercialeCaduta = sezioniCommerciali[0];
        
        for (let i = 0; i < sezioniCommerciali.length; i++) {
            if (sezioniCommerciali[i] >= sezioneCaduta) {
                sezioneCommercialeCaduta = sezioniCommerciali[i];
                break;
            }
            
            // Se siamo all'ultimo elemento e ancora non abbiamo trovato una sezione adeguata
            if (i === sezioniCommerciali.length - 1) {
                sezioneCommercialeCaduta = sezioniCommerciali[i];
            }
        }
        
        // Determina la sezione consigliata (il massimo tra sezione per portata e sezione per caduta di tensione)
        const sezioneConsigliata = Math.max(sezionePortata, sezioneCommercialeCaduta);
        
        // Calcola la portata massima con la sezione consigliata
        let portataMaxSezioneConsigliata;
        
        if (materialeConduttore === 'rame') {
            if (sezioneConsigliata in portateRame[tipoIsolamento][metodoPosa]) {
                portataMaxSezioneConsigliata = portateRame[tipoIsolamento][metodoPosa][sezioneConsigliata] * fattoreTemperatura;
            } else {
                // Se la sezione non è presente nella tabella, usa la più vicina inferiore
                const sezioniDisponibili = Object.keys(portateRame[tipoIsolamento][metodoPosa]).map(parseFloat).sort((a, b) => a - b);
                let sezioneInferiore = sezioniDisponibili[0];
                
                for (const sezione of sezioniDisponibili) {
                    if (sezione <= sezioneConsigliata) {
                        sezioneInferiore = sezione;
                    } else {
                        break;
                    }
                }
                
                portataMaxSezioneConsigliata = portateRame[tipoIsolamento][metodoPosa][sezioneInferiore] * fattoreTemperatura;
            }
        } else { // alluminio
            if (sezioneConsigliata in portateAlluminio[tipoIsolamento][metodoPosa]) {
                portataMaxSezioneConsigliata = portateAlluminio[tipoIsolamento][metodoPosa][sezioneConsigliata] * fattoreTemperatura;
            } else {
                // Se la sezione non è presente nella tabella, usa la più vicina inferiore
                const sezioniDisponibili = Object.keys(portateAlluminio[tipoIsolamento][metodoPosa]).map(parseFloat).sort((a, b) => a - b);
                let sezioneInferiore = sezioniDisponibili[0];
                
                for (const sezione of sezioniDisponibili) {
                    if (sezione <= sezioneConsigliata) {
                        sezioneInferiore = sezione;
                    } else {
                        break;
                    }
                }
                
                portataMaxSezioneConsigliata = portateAlluminio[tipoIsolamento][metodoPosa][sezioneInferiore] * fattoreTemperatura;
            }
        }
        
        // Calcola la caduta di tensione effettiva con la sezione consigliata
        let cadutaTensioneEffettiva;
        
        if (tipoSistema === 'monofase') {
            cadutaTensioneEffettiva = (2 * resistivitaMateriale * lunghezza * correnteImpiego * 100) / (sezioneConsigliata * tensione);
        } else { // trifase
            cadutaTensioneEffettiva = (Math.sqrt(3) * resistivitaMateriale * lunghezza * correnteImpiego * 100) / (sezioneConsigliata * tensione);
        }
        
        // Mostra i risultati
        document.getElementById('corrente-impiego').textContent = `${correnteImpiego.toFixed(2)} A`;
        document.getElementById('sezione-portata').textContent = `${sezionePortata} mm²`;
        document.getElementById('sezione-caduta').textContent = `${sezioneCommercialeCaduta} mm² (calcolata: ${sezioneCaduta.toFixed(2)} mm²)`;
        document.getElementById('sezione-consigliata').textContent = `${sezioneConsigliata} mm²`;
        document.getElementById('portata-massima').textContent = `${portataMaxSezioneConsigliata.toFixed(2)} A`;
        document.getElementById('caduta-tensione-effettiva').textContent = `${cadutaTensioneEffettiva.toFixed(2)}%`;
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 