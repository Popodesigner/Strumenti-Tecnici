document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-dimensionamento');
    
    // Definizione dei diametri commerciali per ogni materiale (in mm)
    const diametriCommerciali = {
        rame: [8, 10, 12, 14, 15, 16, 18, 22, 28, 35, 42, 54, 64, 76.1, 88.9, 108],
        acciaio: [10.2, 13.5, 17.2, 21.3, 26.9, 33.7, 42.4, 48.3, 60.3, 76.1, 88.9, 101.6, 114.3, 139.7, 168.3],
        pvc: [16, 20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 180, 200, 225, 250],
        multistrato: [14, 16, 18, 20, 26, 32, 40, 50, 63, 75, 90]
    };
    
    // Coefficienti di scabrezza per ogni materiale (mm)
    const scabrezza = {
        rame: 0.0015,
        acciaio: 0.045,
        pvc: 0.007,
        multistrato: 0.007
    };
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Recupera i valori dal form
        const portata = parseFloat(document.getElementById('portata').value); // l/s
        const velocitaMax = parseFloat(document.getElementById('velocita').value); // m/s
        const materiale = document.getElementById('materiale').value;
        
        // Converti portata da l/s a m³/s
        const portataM3S = portata / 1000;
        
        // Calcola il diametro minimo teorico (in m)
        const area = portataM3S / velocitaMax;
        const diametroMinimo = Math.sqrt((4 * area) / Math.PI);
        
        // Converti il diametro minimo in mm
        const diametroMinimoMm = diametroMinimo * 1000;
        
        // Trova il diametro commerciale più piccolo che soddisfa il requisito
        const diametriMateriale = diametriCommerciali[materiale];
        let diametroCommerciale = null;
        
        for (let i = 0; i < diametriMateriale.length; i++) {
            if (diametriMateriale[i] >= diametroMinimoMm) {
                diametroCommerciale = diametriMateriale[i];
                break;
            }
        }
        
        // Se non è stato trovato un diametro commerciale adeguato, usa il più grande disponibile
        if (diametroCommerciale === null) {
            diametroCommerciale = diametriMateriale[diametriMateriale.length - 1];
        }
        
        // Calcola la velocità effettiva con il diametro commerciale (in m/s)
        const areaEffettiva = Math.PI * Math.pow(diametroCommerciale / 1000 / 2, 2);
        const velocitaEffettiva = portataM3S / areaEffettiva;
        
        // Calcola la perdita di carico unitaria usando la formula di Darcy-Weisbach
        const raggio = diametroCommerciale / 1000 / 2;
        const reynolds = (velocitaEffettiva * diametroCommerciale / 1000) / (0.000001); // Viscosità cinematica dell'acqua a 20°C = 10^-6 m²/s
        const k = scabrezza[materiale] / 1000; // Converti scabrezza da mm a m
        const relativeRoughness = k / (diametroCommerciale / 1000);
        
        // Calcola il fattore di attrito usando l'equazione di Colebrook-White approssimata
        let frictionFactor = 0.02; // Valore iniziale
        for (let i = 0; i < 10; i++) { // 10 iterazioni sono generalmente sufficienti
            frictionFactor = 1 / Math.pow(-2 * Math.log10(relativeRoughness / 3.7 + 2.51 / (reynolds * Math.sqrt(frictionFactor))), 2);
        }
        
        // Calcola la perdita di carico unitaria (Pa/m)
        const perditaCarico = frictionFactor * (1000 * Math.pow(velocitaEffettiva, 2)) / (2 * (diametroCommerciale / 1000));
        
        // Converti la perdita di carico da Pa/m a mmH2O/m
        const perditaCaricoMmH2O = perditaCarico / 9.81;
        
        // Mostra i risultati
        document.getElementById('diametro-minimo').textContent = `${diametroMinimoMm.toFixed(2)} mm`;
        document.getElementById('diametro-commerciale').textContent = `${diametroCommerciale} mm`;
        document.getElementById('velocita-effettiva').textContent = `${velocitaEffettiva.toFixed(2)} m/s`;
        document.getElementById('perdita-carico').textContent = `${perditaCaricoMmH2O.toFixed(2)} mmH₂O/m`;
        
        // Crea una tabella con i diametri commerciali disponibili
        const diametriContainer = document.getElementById('diametri-disponibili');
        diametriContainer.innerHTML = '';
        
        const table = document.createElement('table');
        
        // Crea l'intestazione della tabella
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const thDiametro = document.createElement('th');
        thDiametro.textContent = 'Diametro (mm)';
        headerRow.appendChild(thDiametro);
        
        const thVelocita = document.createElement('th');
        thVelocita.textContent = 'Velocità (m/s)';
        headerRow.appendChild(thVelocita);
        
        const thPerdita = document.createElement('th');
        thPerdita.textContent = 'Perdita (mmH₂O/m)';
        headerRow.appendChild(thPerdita);
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Crea il corpo della tabella
        const tbody = document.createElement('tbody');
        
        diametriMateriale.forEach(diam => {
            const row = document.createElement('tr');
            
            // Evidenzia il diametro selezionato
            if (diam === diametroCommerciale) {
                row.className = 'riga-evidenziata';
            }
            
            const tdDiametro = document.createElement('td');
            tdDiametro.textContent = diam;
            row.appendChild(tdDiametro);
            
            // Calcola la velocità per questo diametro
            const areaDiam = Math.PI * Math.pow(diam / 1000 / 2, 2);
            const velocitaDiam = portataM3S / areaDiam;
            
            const tdVelocita = document.createElement('td');
            tdVelocita.textContent = velocitaDiam.toFixed(2);
            row.appendChild(tdVelocita);
            
            // Calcola la perdita di carico per questo diametro
            const reynoldsDiam = (velocitaDiam * diam / 1000) / (0.000001);
            const relativeRoughnessDiam = k / (diam / 1000);
            
            let frictionFactorDiam = 0.02;
            for (let i = 0; i < 10; i++) {
                frictionFactorDiam = 1 / Math.pow(-2 * Math.log10(relativeRoughnessDiam / 3.7 + 2.51 / (reynoldsDiam * Math.sqrt(frictionFactorDiam))), 2);
            }
            
            const perditaCaricoDiam = frictionFactorDiam * (1000 * Math.pow(velocitaDiam, 2)) / (2 * (diam / 1000));
            const perditaCaricoMmH2ODiam = perditaCaricoDiam / 9.81;
            
            const tdPerdita = document.createElement('td');
            tdPerdita.textContent = perditaCaricoMmH2ODiam.toFixed(2);
            row.appendChild(tdPerdita);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        diametriContainer.appendChild(table);
        
        // Mostra la sezione dei risultati
        document.getElementById('risultati').classList.remove('hidden');
    });
}); 